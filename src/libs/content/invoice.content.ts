// Translation labels
export const t = {
  vi: {
    downloadPdf: 'Tải PDF',
    language: 'Ngôn ngữ',
    saveCustom: 'Lưu thông tin tùy chỉnh',
    editHint: 'Nhấp vào các ô để chỉnh sửa thông tin.',
    invoiceTitle: 'HÓA ĐƠN DỊCH VỤ',
    invoiceSubtitle: 'Service Invoice',
    invoiceNumber: 'Số hóa đơn',
    issueDate: 'Ngày phát hành',
    dueDate: 'Hạn thanh toán',
    paidDate: 'Ngày thanh toán',
    paid: 'ĐÃ THANH TOÁN',
    unpaid: 'CHƯA THANH TOÁN',
    client: 'Khách hàng (Client)',
    contactPerson: 'Người liên hệ',
    taxId: 'MST',
    address: 'Địa chỉ',
    phone: 'Điện thoại',
    email: 'Email',
    website: 'Website',
    account: 'Tài khoản',
    provider: 'Bên cung cấp dịch vụ',
    serviceDetails: 'Chi tiết dịch vụ',
    continued: 'tiếp theo — trang',
    no: 'STT',
    serviceName: 'Tên dịch vụ',
    source: 'Nguồn',
    quantity: 'SL',
    unitPrice: 'Đơn giá',
    discount: 'Giảm giá',
    total: 'Thành tiền',
    plan: 'Gói',
    custom: 'Tùy chỉnh',
    notes: 'Ghi chú',
    notesPlaceholder: 'Thêm ghi chú...',
    subtotal: 'Tổng tiền dịch vụ',
    tax: 'Thuế GTGT',
    grandTotal: 'Tổng thanh toán',
    bankInfo: 'Thông tin chuyển khoản',
    accountHolder: 'Chủ tài khoản:',
    accountNumber: 'Số tài khoản:',
    bank: 'Ngân hàng:',
    representative: 'Người đại diện',
    signNote: '(Ký, ghi rõ họ tên)',
    nextPage: '↓ tiếp theo trang',
    page: 'Trang',
    invoiceFooter: 'Hóa đơn dịch vụ · Invoice #',
  },
  en: {
    downloadPdf: 'Download PDF',
    language: 'Language',
    saveCustom: 'Save custom information',
    editHint: 'Click on the boxes to edit the information.',
    invoiceTitle: 'SERVICE INVOICE',
    invoiceSubtitle: 'Hóa đơn dịch vụ',
    invoiceNumber: 'Invoice Number',
    issueDate: 'Issue Date',
    dueDate: 'Due Date',
    paidDate: 'Paid Date',
    paid: 'PAID',
    unpaid: 'UNPAID',
    client: 'Client (Khách hàng)',
    contactPerson: 'Contact Person',
    taxId: 'Tax ID',
    address: 'Address',
    phone: 'Phone',
    email: 'Email',
    website: 'Website',
    account: 'Account',
    provider: 'Service Provider',
    serviceDetails: 'Service Details',
    continued: 'continued — page',
    no: 'No.',
    serviceName: 'Service Name',
    source: 'Source',
    quantity: 'Qty',
    unitPrice: 'Unit Price',
    discount: 'Discount',
    total: 'Total',
    plan: 'Plan',
    custom: 'Custom',
    notes: 'Notes',
    notesPlaceholder: 'Add notes...',
    subtotal: 'Subtotal',
    tax: 'VAT',
    grandTotal: 'Grand Total',
    bankInfo: 'Bank Transfer Information',
    accountHolder: 'Account Holder:',
    accountNumber: 'Account Number:',
    bank: 'Bank:',
    representative: 'Representative',
    signNote: '(Signature and full name)',
    nextPage: '↓ continued on page',
    page: 'Page',
    invoiceFooter: 'Service Invoice · Invoice #',
  },
};

export interface CompanyInfo {
  name: string;
  tagline: string;
  mst: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  bankAccount: string;
  bankName: string;
  bankBranch: string;
}

export interface ClientInfo {
  companyName: string;
  contactPerson: string;
  mst: string;
  address: string;
  phone: string;
  email: string;
}

export const defaultCompanyInfo: CompanyInfo = {
  name: 'Keng VietNam',
  tagline: 'Marketing Agency',
  mst: '079000000000',
  phone: '0000000',
  email: 'contact@kengvietnam.com',
  website: 'kengvietnam.com',
  address: 'TP.HCM',
  bankAccount: '00000000000',
  bankName: 'Keng VietNam',
  bankBranch: 'Chi nhánh TP.HCM',
};

export const defaultClientInfo: ClientInfo = {
  companyName: 'Công ty TNHH ABC',
  contactPerson: 'Nguyễn Văn A',
  mst: '0123456789',
  address: 'TP. Hồ Chí Minh',
  phone: '028 1234 5678',
  email: 'contact@company.com',
};
