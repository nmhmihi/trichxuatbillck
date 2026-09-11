import { GoogleGenAI, Type } from "@google/genai";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "30mb",
    },
  },
};

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Chưa tìm thấy GEMINI_API_KEY. Vui lòng cấu hình biến môi trường GEMINI_API_KEY trong Vercel Settings > Environment Variables."
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const { imageBase64, mimeType = "image/jpeg" } = req.body || {};

    if (!imageBase64) {
      return res.status(400).json({
        error: "Vui lòng cung cấp hình ảnh biên lai / bill ngân hàng cần trích xuất.",
      });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, "").trim();

    const ai = getGeminiClient();

    const extractionPrompt = `Bạn là hệ thống AI phân tích và OCR biên lai/bill chuyển tiền ngân hàng chuyên sâu tại Việt Nam.

YÊU CẦU QUAN TRỌNG NHẤT:
Người dùng chỉ cần lấy chính xác 3 dòng thông tin sau:
1. "recipientName" (Người nhận): Họ và tên người thụ hưởng / nhận tiền (thường in HOA, ví dụ: LE THI NGOC TRAM). Chỉ trả về tên, không chứa nhãn "Người nhận:" hay "Tên thụ hưởng:".
2. "recipientAccountNumber" (Số tài khoản nhận): Số tài khoản ngân hàng hoặc số thẻ của người nhận tiền (ví dụ: 0326537738). Chỉ trả về dãy số, không chứa nhãn "STK:" hay khoảng trắng thừa.
3. "recipientBank" (Ngân hàng nhận): Tên ngân hàng của người nhận tiền (ví dụ: NHTMCP Quân Đội (MB), Vietcombank, Techcombank, ACB, VPBank, BIDV, TPBank...). Nếu trên bill ghi tên đầy đủ hoặc viết tắt của ngân hàng nhận thì lấy đúng như thế.

Lưu ý:
- Phân biệt rõ giữa người nhận (thụ hưởng) và người chuyển (người gửi). Chỉ lấy thông tin người NHẬN tiền.
- Bỏ qua các nhãn thừa, chỉ lấy giá trị thực tế.`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        recipientName: {
          type: Type.STRING,
          description: "Họ và tên người nhận tiền, thường in HOA",
        },
        recipientAccountNumber: {
          type: Type.STRING,
          description: "Số tài khoản hoặc số thẻ người nhận tiền",
        },
        recipientBank: {
          type: Type.STRING,
          description: "Tên ngân hàng của người nhận tiền",
        },
      },
      required: [
        "recipientName",
        "recipientAccountNumber",
        "recipientBank",
      ],
    };

    const candidateModels = [
      "gemini-3.1-flash-lite",
      "gemini-3.8-flash",
    ];

    let response = null;
    let fallbackParsedResponse: any = null;
    let lastModelError: any = null;

    for (const model of candidateModels) {
      try {
        console.log(`[OCR Vercel] Đang xử lý bằng model: ${model}...`);
        const candidateResponse = await ai.models.generateContent({
          model,
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: cleanBase64,
                },
              },
              {
                text: extractionPrompt,
              },
            ],
          },
          config: {
            systemInstruction:
              "Bạn là trợ lý AI chuyên nghiệp phân tích hóa đơn chứng từ ngân hàng. Luôn trích xuất trung thực, chính xác theo đúng dữ liệu hiển thị trên ảnh.",
            temperature: 0,
            responseMimeType: "application/json",
            responseSchema,
          },
        });

        if (candidateResponse && candidateResponse.text) {
          try {
            const testData = JSON.parse(candidateResponse.text);
            const name = String(testData.recipientName || "").trim();
            const acc = String(testData.recipientAccountNumber || "").trim();
            const bank = String(testData.recipientBank || "").trim();

            const hasValidField =
              (name && name.toLowerCase() !== "null" && name.toLowerCase() !== "undefined") ||
              (acc && acc.toLowerCase() !== "null" && acc.toLowerCase() !== "undefined") ||
              (bank && bank.toLowerCase() !== "null" && bank.toLowerCase() !== "undefined");

            if (hasValidField) {
              response = candidateResponse;
              break;
            } else {
              if (!fallbackParsedResponse) {
                fallbackParsedResponse = testData;
              }
            }
          } catch {
            // JSON parse fail on candidate, try next
          }
        }
      } catch (err: any) {
        lastModelError = err;
        const errString = err?.message || String(err);
        const isDemandSpike =
          errString.includes("503") ||
          errString.includes("UNAVAILABLE") ||
          errString.includes("high demand") ||
          errString.includes("429") ||
          errString.includes("RESOURCE_EXHAUSTED");

        if (isDemandSpike) {
          continue;
        } else {
          continue;
        }
      }
    }

    const sanitizeData = (obj: any) => {
      const clean = (val: any) => {
        if (!val) return "";
        const s = String(val).trim();
        const lower = s.toLowerCase();
        if (lower === "null" || lower === "undefined" || lower === "none" || lower === "n/a") return "";
        return s;
      };
      return {
        recipientName: clean(obj?.recipientName),
        recipientAccountNumber: clean(obj?.recipientAccountNumber),
        recipientBank: clean(obj?.recipientBank),
      };
    };

    if (!response) {
      if (fallbackParsedResponse) {
        return res.status(200).json({
          success: true,
          data: sanitizeData(fallbackParsedResponse),
        });
      }
      throw (
        lastModelError ||
        new Error("Không tìm thấy thông tin chuyển khoản trên ảnh hoặc ảnh quá mờ. Vui lòng kiểm tra lại ảnh bill.")
      );
    }

    const responseText = response.text || "{}";
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      return res.status(500).json({
        error: "Không thể phân tích dữ liệu trả về từ mô hình AI. Vui lòng thử lại.",
      });
    }

    return res.status(200).json({
      success: true,
      data: sanitizeData(parsedData),
    });
  } catch (err: any) {
    console.error("Lỗi khi trích xuất bill:", err);
    return res.status(500).json({
      error: err?.message || "Đã xảy ra lỗi khi phân tích ảnh bill. Vui lòng thử lại.",
    });
  }
}
