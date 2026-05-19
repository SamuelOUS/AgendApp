export interface LoginSelectors {
  docType: string;
  docTypeSelect: (docType: string) => string;
  docNumberInput: string;
  submitBtn: string;
  passwordInput: string;
  kbPreviewInput: string;
  kbDiv: string;
  kbDigitBtn: (d: string) => string;
  kbAcceptBtn: string;
  kbBorrarBtn: string;
  homeHelloText: string;
}

export interface HomeSelectors {
  citasMedicoGeneralCard: string;
  solicitudCitasTitle: string;
}