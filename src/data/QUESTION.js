// ==========================
//  MonopolyEdu – Question Set (phiên bản chỉ còn text & choice)
//  Chủ đề: Cạnh tranh ở cấp độ độc quyền
// ==========================

export const QUESTIONS = [
  // ==========================
  // 1️⃣ ĐỊNH NGHĨA / KHÁI NIỆM (10)
  // ==========================
  { id: 1, type: "text", q: "Độc quyền là gì?", a: "Sự liên minh giữa các doanh nghiệp lớn" },
  { id: 2, type: "text", q: "Ai dự báo rằng tự do cạnh tranh sinh ra độc quyền?", a: "C. Mác" },
  { id: 3, type: "text", q: "Theo Lênin, cạnh tranh phát triển tới mức nào thì sinh ra độc quyền?", a: "Tập trung sản xuất cao" },
  { id: 4, type: "text", q: "Giá do tổ chức độc quyền áp đặt được gọi là gì?", a: "Giá độc quyền" },
  { id: 5, type: "text", q: "Độc quyền nhà nước là gì?", a: "Nhà nước nắm vị thế độc quyền trong lĩnh vực then chốt" },
  { id: 6, type: "text", q: "Mục tiêu của độc quyền là gì?", a: "Thu lợi nhuận độc quyền cao" },
  { id: 7, type: "text", q: "Độc quyền hình thành từ quá trình nào?", a: "Tích tụ và tập trung sản xuất" },
  { id: 8, type: "text", q: "Độc quyền có thể hình thành theo hai con đường nào?", a: "Tự nhiên và do nhà nước" },
  { id: 9, type: "text", q: "Độc quyền xuất hiện mạnh từ thế kỷ nào?", a: "Cuối XIX – đầu XX" },
  { id: 10, type: "text", q: "Trong CNTB, độc quyền nhà nước phục vụ lợi ích của ai?", a: "Tư bản độc quyền" },

  // ==========================
  // 2️⃣ TRẮC NGHIỆM (30) – gồm các nhóm gốc + phần thay thế vận dụng / phản biện
  // ==========================
  {
    id: 11,
    type: "choice",
    q: "Nguyên nhân KHÔNG dẫn đến độc quyền là:",
    options: ["A. Tiến bộ kỹ thuật", "B. Khủng hoảng kinh tế", "C. Sự ngẫu nhiên", "D. Tích tụ vốn"],
    a: "C. Sự ngẫu nhiên",
  },
  {
    id: 12,
    type: "choice",
    q: "Ai khẳng định 'Tự do cạnh tranh đẻ ra tập trung sản xuất và dẫn tới độc quyền'?",
    options: ["A. Adam Smith", "B. C. Mác", "C. Keynes", "D. Lênin"],
    a: "D. Lênin",
  },
  {
    id: 13,
    type: "choice",
    q: "Độc quyền nhà nước thường xuất hiện trong ngành nào?",
    options: ["A. May mặc", "B. Năng lượng", "C. Thực phẩm", "D. Thời trang"],
    a: "B. Năng lượng",
  },
  {
    id: 14,
    type: "choice",
    q: "Độc quyền làm gì với giá bán hàng hóa?",
    options: ["A. Giảm mạnh", "B. Ổn định", "C. Áp giá cao", "D. Bán theo chi phí"],
    a: "C. Áp giá cao",
  },
  {
    id: 15,
    type: "choice",
    q: "Một trong các tác động tích cực của độc quyền là:",
    options: ["A. Kìm hãm kỹ thuật", "B. Thúc đẩy tiến bộ kỹ thuật", "C. Giảm năng suất", "D. Tăng giá thành"],
    a: "B. Thúc đẩy tiến bộ kỹ thuật",
  },
  {
    id: 16,
    type: "choice",
    q: "Tác động tiêu cực của độc quyền là:",
    options: ["A. Tăng cạnh tranh", "B. Giảm phân hóa", "C. Gây thiệt hại cho người tiêu dùng", "D. Ổn định giá cả"],
    a: "C. Gây thiệt hại cho người tiêu dùng",
  },
  {
    id: 17,
    type: "choice",
    q: "Cạnh tranh giữa các tổ chức độc quyền cùng ngành có thể kết thúc bằng:",
    options: ["A. Phá sản hoặc thỏa hiệp", "B. Xóa bỏ cạnh tranh", "C. Giảm sản lượng", "D. Mở rộng đầu tư nhỏ"],
    a: "A. Phá sản hoặc thỏa hiệp",
  },
  {
    id: 18,
    type: "choice",
    q: "Trong CNTB, độc quyền nhà nước hình thành dựa trên sự kết hợp giữa:",
    options: ["A. Lao động – tư bản", "B. Nhà nước – tư bản độc quyền", "C. Công nhân – nhà nước", "D. Ngân hàng – người dân"],
    a: "B. Nhà nước – tư bản độc quyền",
  },
  {
    id: 19,
    type: "choice",
    q: "Giá độc quyền mua thường ở mức:",
    options: ["A. Cao", "B. Trung bình", "C. Thấp", "D. Bằng giá thị trường"],
    a: "C. Thấp",
  },
  {
    id: 20,
    type: "choice",
    q: "Tác động xã hội tiêu cực của độc quyền là:",
    options: ["A. Giảm phân hóa giàu nghèo", "B. Gia tăng phân hóa giàu nghèo", "C. Giảm lợi nhuận tư bản", "D. Tăng việc làm"],
    a: "B. Gia tăng phân hóa giàu nghèo",
  },
  {
    id: 21,
    type: "choice",
    q: "Độc quyền có xóa bỏ hoàn toàn cạnh tranh không?",
    options: ["A. Có", "B. Không", "C. Chỉ một phần", "D. Tùy từng quốc gia"],
    a: "B. Không",
  },
  {
    id: 22,
    type: "choice",
    q: "Cạnh tranh gay gắt giữa doanh nghiệp nhỏ dẫn đến điều gì?",
    options: ["A. Mở rộng thị trường", "B. Hình thành độc quyền", "C. Tăng lương", "D. Ổn định giá"],
    a: "B. Hình thành độc quyền",
  },
  {
    id: 23,
    type: "choice",
    q: "Khủng hoảng kinh tế năm 1873 có vai trò gì trong quá trình độc quyền?",
    options: ["A. Làm doanh nghiệp nhỏ phát triển", "B. Thúc đẩy hình thành doanh nghiệp độc quyền", "C. Tăng cạnh tranh", "D. Không ảnh hưởng"],
    a: "B. Thúc đẩy hình thành doanh nghiệp độc quyền",
  },
  {
    id: 24,
    type: "choice",
    q: "Độc quyền nhà nước tồn tại trong hệ thống kinh tế nào?",
    options: ["A. Chỉ XHCN", "B. Chỉ TBCN", "C. Cả TBCN và XHCN", "D. Không hệ nào"],
    a: "C. Cả TBCN và XHCN",
  },
  {
    id: 25,
    type: "choice",
    q: "Tích tụ và tập trung vốn càng lớn thì điều gì xảy ra?",
    options: ["A. Sản xuất phân tán hơn", "B. Tập trung sản xuất cao hơn", "C. Giảm quy mô doanh nghiệp", "D. Không thay đổi"],
    a: "B. Tập trung sản xuất cao hơn",
  },
  {
    id: 26,
    type: "choice",
    q: "Độc quyền có thể tác động thế nào đến kỹ thuật?",
    options: ["A. Luôn kìm hãm", "B. Không ảnh hưởng", "C. Có thể thúc đẩy", "D. Phụ thuộc chính sách"],
    a: "C. Có thể thúc đẩy",
  },
  {
    id: 27,
    type: "choice",
    q: "Giá độc quyền so với giá thị trường thường như thế nào?",
    options: ["A. Cao hơn khi bán, thấp hơn khi mua", "B. Luôn thấp hơn", "C. Bằng nhau", "D. Không cố định"],
    a: "A. Cao hơn khi bán, thấp hơn khi mua",
  },
  {
    id: 28,
    type: "choice",
    q: "Độc quyền có gây thiệt hại cho người tiêu dùng không?",
    options: ["A. Có", "B. Không", "C. Không chắc", "D. Chỉ đôi khi"],
    a: "A. Có",
  },
  {
    id: 29,
    type: "choice",
    q: "Độc quyền nhà nước tư bản phục vụ lợi ích của ai?",
    options: ["A. Toàn dân", "B. Tư bản độc quyền", "C. Chính phủ", "D. Người lao động"],
    a: "B. Tư bản độc quyền",
  },
  {
    id: 30,
    type: "choice",
    q: "Sự xuất hiện của độc quyền làm cạnh tranh trở nên:",
    options: ["A. Mất hoàn toàn", "B. Đa dạng hơn", "C. Giảm mạnh", "D. Không đổi"],
    a: "B. Đa dạng hơn",
  },

  // === 10 câu thay thế vận dụng & phản biện ===
  {
    id: 41,
    type: "choice",
    q: "Khi nhà nước kiểm soát lĩnh vực điện lực, đó là loại độc quyền gì?",
    options: ["A. Độc quyền tư nhân", "B. Độc quyền nhà nước", "C. Liên minh độc quyền", "D. Độc quyền nhóm"],
    a: "B. Độc quyền nhà nước",
  },
  {
    id: 42,
    type: "choice",
    q: "Vì sao độc quyền có thể vừa thúc đẩy vừa kìm hãm kỹ thuật?",
    options: [
      "A. Do lợi nhuận và cạnh tranh khác nhau",
      "B. Do thiếu nguồn vốn",
      "C. Do luật cấm đổi mới",
      "D. Do chi phí nhân công cao",
    ],
    a: "A. Do lợi nhuận và cạnh tranh khác nhau",
  },
  {
    id: 43,
    type: "choice",
    q: "Khi doanh nghiệp nhỏ bị thâu tóm bởi doanh nghiệp lớn, xu hướng gì xảy ra?",
    options: ["A. Phân tán sản xuất", "B. Tập trung sản xuất", "C. Giảm năng suất", "D. Mở rộng xuất khẩu"],
    a: "B. Tập trung sản xuất",
  },
  {
    id: 44,
    type: "choice",
    q: "Vì sao nói độc quyền và cạnh tranh là hai mặt của cùng một quá trình?",
    options: [
      "A. Vì cạnh tranh sinh ra độc quyền và ngược lại",
      "B. Vì cả hai đều bị cấm",
      "C. Vì cùng giảm lợi nhuận",
      "D. Vì không liên quan nhau",
    ],
    a: "A. Vì cạnh tranh sinh ra độc quyền và ngược lại",
  },
  {
    id: 45,
    type: "choice",
    q: "Trong thời đại số, độc quyền dữ liệu phản ánh điều gì?",
    options: [
      "A. Quyền lực kiểm soát thông tin",
      "B. Cạnh tranh hoàn hảo",
      "C. Giảm đổi mới",
      "D. Mất cân bằng thương mại",
    ],
    a: "A. Quyền lực kiểm soát thông tin",
  },
  {
    id: 46,
    type: "choice",
    q: "Ngành nào cần duy trì độc quyền để phát triển quốc gia?",
    options: ["A. Năng lượng", "B. Thời trang", "C. Giải trí", "D. Thực phẩm nhanh"],
    a: "A. Năng lượng",
  },
  {
    id: 47,
    type: "choice",
    q: "Vì sao độc quyền không nên bị xóa bỏ hoàn toàn?",
    options: [
      "A. Vì giúp duy trì ổn định và đầu tư lớn",
      "B. Vì gây khó cho doanh nghiệp nhỏ",
      "C. Vì tăng giá hàng hóa",
      "D. Vì giảm cạnh tranh",
    ],
    a: "A. Vì giúp duy trì ổn định và đầu tư lớn",
  },
  {
    id: 48,
    type: "choice",
    q: "Hậu quả xã hội nghiêm trọng nhất khi độc quyền bị nhóm lợi ích chi phối là:",
    options: [
      "A. Bất bình đẳng và tham nhũng",
      "B. Giảm đầu tư",
      "C. Tăng lương công nhân",
      "D. Ổn định xã hội",
    ],
    a: "A. Bất bình đẳng và tham nhũng",
  },
  {
    id: 49,
    type: "choice",
    q: "Biện pháp kiểm soát tác động tiêu cực của độc quyền là:",
    options: ["A. Luật cạnh tranh và minh bạch", "B. Giảm đầu tư công", "C. Tăng thuế thu nhập", "D. Hạn chế lao động"],
    a: "A. Luật cạnh tranh và minh bạch",
  },
  {
    id: 50,
    type: "choice",
    q: "Sinh viên kinh tế nên có thái độ nào với cạnh tranh độc quyền?",
    options: ["A. Hiểu bản chất và hành động công bằng", "B. Cạnh tranh bằng mọi giá", "C. Phớt lờ kinh tế học", "D. Tránh tham gia thị trường"],
    a: "A. Hiểu bản chất và hành động công bằng",
  },

  // ==========================
  // 3️⃣ ĐIỀN KHUYẾT (10)
  // ==========================
  { id: 31, type: "text", q: "C. Mác nói: 'Tự do cạnh tranh đẻ ra ________ và sự ________ này dẫn tới độc quyền.'", a: "tập trung sản xuất" },
  { id: 32, type: "text", q: "Cuộc khủng hoảng kinh tế năm ________ tạo điều kiện cho độc quyền hình thành.", a: "1873" },
  { id: 33, type: "text", q: "Hệ thống ________ thúc đẩy tập trung sản xuất và hình thành công ty cổ phần.", a: "tín dụng" },
  { id: 34, type: "text", q: "Độc quyền thường áp đặt giá bán ________ và giá mua ________.", a: "cao, thấp" },
  { id: 35, type: "text", q: "Độc quyền nhà nước hình thành do yêu cầu điều tiết từ ________.", a: "trung tâm kinh tế" },
  { id: 36, type: "text", q: "Mục tiêu của nhà nước khi độc quyền trong ngành trọng điểm là đảm bảo ________ kinh tế.", a: "ổn định" },
  { id: 37, type: "text", q: "Độc quyền nhà nước tư bản là sự cộng sinh giữa nhà nước và ________.", a: "tư bản độc quyền" },
  { id: 38, type: "text", q: "Độc quyền có thể kìm hãm ________ khi không có cạnh tranh.", a: "sáng tạo" },
  { id: 39, type: "text", q: "Độc quyền dẫn đến phân hóa ________ trong xã hội.", a: "giàu – nghèo" },
  { id: 40, type: "text", q: "Các tổ chức độc quyền liên kết với nhau tạo thành ________ để kiểm soát thị trường.", a: "liên minh" },
];
