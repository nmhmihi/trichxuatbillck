import { SampleBill } from '../types';

// Helper to convert SVG string to standard data URI
function svgToDataUrl(svgString: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString.trim())}`;
}

export const SAMPLE_BILLS: SampleBill[] = [
  {
    id: 'sample-vcb',
    title: 'Biên lai Vietcombank',
    bankName: 'Vietcombank',
    amount: '2.500.000 VND',
    recipient: 'TRAN THI MAI ANH',
    account: '1029384756',
    svgDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="850" viewBox="0 0 600 850" style="background:#f4f7f5; font-family:system-ui, -apple-system, sans-serif;">
        <rect width="600" height="850" fill="#f4f7f6" />
        <rect x="25" y="25" width="550" height="800" rx="20" fill="#ffffff" stroke="#e0e8e3" stroke-width="2" />
        
        <!-- Header -->
        <path d="M 25 45 C 25 34, 34 25, 45 25 L 555 25 C 566 25, 575 34, 575 45 L 575 140 L 25 140 Z" fill="#005a36" />
        <text x="300" y="70" text-anchor="middle" fill="#ffffff" font-size="22" font-weight="700">VIETCOMBANK DIGIBANK</text>
        <text x="300" y="102" text-anchor="middle" fill="#d4edda" font-size="14" font-weight="500">CHUYỂN TIỀN NHANH 247 THÀNH CÔNG</text>

        <!-- Status Icon -->
        <circle cx="300" cy="180" r="32" fill="#e8f5e9" stroke="#2e7d32" stroke-width="3" />
        <path d="M288 180 L296 188 L314 170" fill="none" stroke="#2e7d32" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
        
        <text x="300" y="240" text-anchor="middle" fill="#1b5e20" font-size="28" font-weight="800">2.500.000 VND</text>
        <text x="300" y="265" text-anchor="middle" fill="#666666" font-size="13">14:35 - Thứ Năm, 10/09/2026</text>

        <!-- Divider -->
        <line x1="60" y1="295" x2="540" y2="295" stroke="#e0e0e0" stroke-width="1" stroke-dasharray="4,4" />

        <!-- Primary Target Fields -->
        <text x="60" y="340" fill="#777777" font-size="14">Tên người nhận:</text>
        <text x="540" y="340" text-anchor="end" fill="#005a36" font-size="16" font-weight="700">TRAN THI MAI ANH</text>

        <text x="60" y="390" fill="#777777" font-size="14">Số tài khoản nhận:</text>
        <text x="540" y="390" text-anchor="end" fill="#111827" font-size="16" font-weight="700" letter-spacing="1">1029384756</text>

        <text x="60" y="440" fill="#777777" font-size="14">Ngân hàng nhận:</text>
        <text x="540" y="440" text-anchor="end" fill="#111827" font-size="16" font-weight="600">TMCP Ngoại Thương VN (Vietcombank)</text>

        <!-- Secondary Fields -->
        <line x1="60" y1="475" x2="540" y2="475" stroke="#eeeeee" stroke-width="1" />

        <text x="60" y="520" fill="#777777" font-size="14">Người gửi:</text>
        <text x="540" y="520" text-anchor="end" fill="#333333" font-size="15" font-weight="500">NGUYEN VAN HOANG</text>

        <text x="60" y="570" fill="#777777" font-size="14">Tài khoản nguồn:</text>
        <text x="540" y="570" text-anchor="end" fill="#555555" font-size="14">0011004829102</text>

        <text x="60" y="620" fill="#777777" font-size="14">Mã giao dịch:</text>
        <text x="540" y="620" text-anchor="end" fill="#111827" font-size="14" font-weight="600">VCB98347102981</text>

        <text x="60" y="670" fill="#777777" font-size="14">Nội dung chuyển tiền:</text>
        <text x="540" y="670" text-anchor="end" fill="#111827" font-size="14" font-weight="500">Hoang chuyen tien tien phong thang 9</text>

        <!-- Footer watermark -->
        <rect x="60" y="730" width="480" height="50" rx="8" fill="#f0f7f3" />
        <text x="300" y="760" text-anchor="middle" fill="#005a36" font-size="13" font-weight="600">✓ Giao dịch đã được hệ thống NAPAS xử lý thành công</text>
      </svg>
    `),
  },
  {
    id: 'sample-tcb',
    title: 'Biên lai Techcombank',
    bankName: 'Techcombank',
    amount: '12.800.000 VND',
    recipient: 'CONG TY TNHH MINH PHAT',
    account: '19034827104921',
    svgDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="850" viewBox="0 0 600 850" style="background:#fafafa; font-family:system-ui, -apple-system, sans-serif;">
        <rect width="600" height="850" fill="#f5f5f5" />
        <rect x="25" y="25" width="550" height="800" rx="24" fill="#ffffff" stroke="#e5e5e5" stroke-width="1.5" />
        
        <!-- Header Techcombank Red -->
        <rect x="25" y="25" width="550" height="120" rx="24" fill="#e01a22" />
        <text x="300" y="75" text-anchor="middle" fill="#ffffff" font-size="24" font-weight="800" letter-spacing="1">TECHCOMBANK</text>
        <text x="300" y="105" text-anchor="middle" fill="#ffcccc" font-size="13">GIAO DỊCH THÀNH CÔNG</text>

        <!-- Amount Box -->
        <text x="300" y="195" text-anchor="middle" fill="#e01a22" font-size="32" font-weight="800">12.800.000 VND</text>
        <text x="300" y="225" text-anchor="middle" fill="#888888" font-size="13">Thời gian: 09:15, 11/09/2026</text>

        <rect x="50" y="260" width="500" height="480" rx="16" fill="#fafafa" stroke="#f0f0f0" />

        <!-- Key Target Extracted Fields -->
        <text x="80" y="305" fill="#666666" font-size="14">Tên người nhận:</text>
        <text x="520" y="305" text-anchor="end" fill="#111827" font-size="16" font-weight="700">CONG TY TNHH MINH PHAT</text>

        <text x="80" y="360" fill="#666666" font-size="14">Số tài khoản nhận:</text>
        <text x="520" y="360" text-anchor="end" fill="#e01a22" font-size="17" font-weight="700" letter-spacing="1">19034827104921</text>

        <text x="80" y="415" fill="#666666" font-size="14">Ngân hàng nhận:</text>
        <text x="520" y="415" text-anchor="end" fill="#111827" font-size="15" font-weight="600">Techcombank (TCB)</text>

        <line x1="80" y1="445" x2="520" y2="445" stroke="#e5e5e5" stroke-width="1" />

        <text x="80" y="485" fill="#666666" font-size="14">Người gửi:</text>
        <text x="520" y="485" text-anchor="end" fill="#333333" font-size="14" font-weight="500">LE THI THANH TRUC</text>

        <text x="80" y="535" fill="#666666" font-size="14">Mã giao dịch:</text>
        <text x="520" y="535" text-anchor="end" fill="#333333" font-size="14" font-weight="600">FT262548910023</text>

        <text x="80" y="585" fill="#666666" font-size="14">Nội dung chuyển khoản:</text>
        <text x="520" y="585" text-anchor="end" fill="#111827" font-size="14" font-weight="500">Thanh toan hop dong cung cap thiet bi 0926</text>

        <text x="80" y="635" fill="#666666" font-size="14">Phí giao dịch:</text>
        <text x="520" y="635" text-anchor="end" fill="#10b981" font-size="14" font-weight="600">0 VND (Miễn phí)</text>

        <rect x="75" y="665" width="450" height="50" rx="8" fill="#fee2e2" />
        <text x="300" y="695" text-anchor="middle" fill="#b91c1c" font-size="13" font-weight="600">Biên lai điện tử xác thực Techcombank Mobile</text>
      </svg>
    `),
  },
  {
    id: 'sample-mb',
    title: 'Biên lai MB Bank',
    bankName: 'MB Bank',
    amount: '750.000 VND',
    recipient: 'PHAM DUC THANG',
    account: '0988776655',
    svgDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="850" viewBox="0 0 600 850" style="background:#0f172a; font-family:system-ui, -apple-system, sans-serif;">
        <rect width="600" height="850" fill="#0c1322" />
        <rect x="25" y="25" width="550" height="800" rx="24" fill="#131e33" stroke="#1e293b" stroke-width="1.5" />
        
        <!-- Header MB Blue -->
        <path d="M 25 49 C 25 35, 35 25, 49 25 L 551 25 C 565 25, 575 35, 575 49 L 575 130 L 25 130 Z" fill="#1d4ed8" />
        <text x="300" y="75" text-anchor="middle" fill="#ffffff" font-size="24" font-weight="800" letter-spacing="1.5">MB BANK</text>
        <text x="300" y="105" text-anchor="middle" fill="#93c5fd" font-size="13" font-weight="500">CHUYỂN KHOẢN LIÊN NGÂN HÀNG THÀNH CÔNG</text>

        <!-- Status Circle -->
        <circle cx="300" cy="180" r="32" fill="#1e3a8a" stroke="#3b82f6" stroke-width="3" />
        <path d="M288 180 L296 188 L314 170" fill="none" stroke="#60a5fa" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />

        <text x="300" y="245" text-anchor="middle" fill="#60a5fa" font-size="30" font-weight="800">750.000 VND</text>
        <text x="300" y="275" text-anchor="middle" fill="#94a3b8" font-size="13">18:42:10 - 10/09/2026</text>

        <!-- Details Card -->
        <rect x="45" y="305" width="510" height="430" rx="16" fill="#18233c" stroke="#334155" stroke-width="1" />

        <text x="75" y="350" fill="#94a3b8" font-size="14">Người thụ hưởng:</text>
        <text x="525" y="350" text-anchor="end" fill="#ffffff" font-size="16" font-weight="700">PHAM DUC THANG</text>

        <text x="75" y="405" fill="#94a3b8" font-size="14">Số tài khoản nhận:</text>
        <text x="525" y="405" text-anchor="end" fill="#38bdf8" font-size="17" font-weight="700" letter-spacing="1">0988776655</text>

        <text x="75" y="460" fill="#94a3b8" font-size="14">Ngân hàng thụ hưởng:</text>
        <text x="525" y="460" text-anchor="end" fill="#ffffff" font-size="15" font-weight="600">Ngân hàng TMCP Quân Đội (MB)</text>

        <line x1="75" y1="495" x2="525" y2="495" stroke="#334155" stroke-width="1" />

        <text x="75" y="540" fill="#94a3b8" font-size="14">Người chuyển:</text>
        <text x="525" y="540" text-anchor="end" fill="#cbd5e1" font-size="14">VO THI KIM NGAN</text>

        <text x="75" y="590" fill="#94a3b8" font-size="14">Mã giao dịch:</text>
        <text x="525" y="590" text-anchor="end" fill="#cbd5e1" font-size="14" font-weight="600">MBB8492019482</text>

        <text x="75" y="640" fill="#94a3b8" font-size="14">Lời nhắn / Nội dung:</text>
        <text x="525" y="640" text-anchor="end" fill="#e2e8f0" font-size="14" font-weight="500">Ngan gui tien mua sach toan 12</text>

        <rect x="75" y="750" width="450" height="40" rx="8" fill="#1e293b" />
        <text x="300" y="775" text-anchor="middle" fill="#38bdf8" font-size="13" font-weight="600">Xác thực bởi MBBank Secure Token</text>
      </svg>
    `),
  },
];
