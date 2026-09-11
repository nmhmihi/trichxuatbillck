import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support up to 30MB base64 images from modern phone cameras
  app.use(express.json({ limit: "30mb" }));
  app.use(express.urlencoded({ extended: true, limit: "30mb" }));

  function getGeminiClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "Chưa tìm thấy GEMINI_API_KEY. Vui lòng cấu hình API Key trong mục Settings > Secrets."
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

  // API Health Check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // API Endpoint to Extract Bank Bill Information
  app.post("/api/extract-bill", async (req, res) => {
    try {
      const { imageBase64, mimeType = "image/jpeg" } = req.body;

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

      // Candidate models for OCR - prioritizing gemini-3.1-flash-lite for fast and accurate Vietnamese receipt OCR
      const candidateModels = [
        "gemini-3.1-flash-lite",
        "gemini-3.8-flash",
      ];

      let response = null;
      let lastModelError: any = null;

      for (const model of candidateModels) {
        try {
          console.log(`[OCR] Đang xử lý bằng model: ${model}...`);
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
              const name = String(testData.recipientName || "").trim().toLowerCase();
              const acc = String(testData.recipientAccountNumber || "").trim().toLowerCase();
              const bank = String(testData.recipientBank || "").trim().toLowerCase();

              const hasValidField =
                (name && name !== "null" && name !== "undefined") ||
                (acc && acc !== "null" && acc !== "undefined") ||
                (bank && bank !== "null" && bank !== "undefined");

              if (hasValidField) {
                console.log(`[OCR] Trích xuất thành công với model ${model}`);
                response = candidateResponse;
                break;
              } else {
                console.log(`[OCR] Model ${model} không tìm thấy nội dung hợp lệ, chuyển model tiếp theo...`);
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
            console.log(`[OCR] Model ${model} đang quá tải, chuyển ngay sang model tiếp theo...`);
            continue;
          } else {
            console.log(`[OCR] Lỗi khi gọi ${model}:`, errString);
            continue;
          }
        }
      }

      // If no model returned non-empty data, check if we got any candidate response
      if (!response) {
        throw (
          lastModelError ||
          new Error("Không tìm thấy thông tin chuyển khoản trên ảnh hoặc ảnh quá mờ. Vui lòng kiểm tra lại ảnh bill.")
        );
      }

      const responseText = response.text || "{}";
      let parsedData;
      try {
        parsedData = JSON.parse(responseText);
      } catch (parseErr) {
        console.error("JSON parse error:", parseErr, responseText);
        return res.status(500).json({
          error: "Không thể phân tích dữ liệu trả về từ mô hình AI. Vui lòng thử lại.",
        });
      }

      return res.json({
        success: true,
        data: parsedData,
      });
    } catch (err: any) {
      console.error("Lỗi khi trích xuất bill:", err);
      let clientMessage =
        err?.message ||
        "Đã xảy ra sự cố khi gọi Google Gemini AI để trích xuất ảnh. Vui lòng kiểm tra lại ảnh và thử lại.";

      if (
        clientMessage.includes("503") ||
        clientMessage.includes("high demand") ||
        clientMessage.includes("UNAVAILABLE")
      ) {
        clientMessage =
          "Hệ thống máy chủ Gemini đang có lượng truy cập cao đột xuất (503). Vui lòng nhấn nút 'Thử lại' sau 2 giây.";
      }

      return res.status(500).json({
        error: clientMessage,
      });
    }
  });

  // Global error handler for API requests to ensure clean JSON responses
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("[API Error Handler]", err);
    if (res.headersSent) {
      return next(err);
    }
    if (err.type === "entity.too.large") {
      return res.status(413).json({
        success: false,
        error: "Dung lượng ảnh quá lớn. Vui lòng chọn ảnh có kích thước nhỏ hơn.",
      });
    }
    return res.status(500).json({
      success: false,
      error: err?.message || "Lỗi xử lý yêu cầu. Vui lòng thử lại.",
    });
  });

  // Vite middleware in dev; static dist files in prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server đang chạy tại cổng http://0.0.0.0:${PORT}`);
  });
}

startServer();
