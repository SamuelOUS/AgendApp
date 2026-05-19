import { LoginSelectors, HomeSelectors } from "../../types/index.types";


//Selectores identifcar etiquetas html en web sura
export const loginSelectors: LoginSelectors = {
  docType: '#ctl00_ContentMain_suraType',
  docTypeSelect: (docType: string) =>
    `#ctl00_ContentMain_suraType option[value="${docType}"]`,
  docNumberInput: '#suraName',
  submitBtn: '#session-internet',
  passwordInput: '#suraPassword',
  kbPreviewInput: 'input.ui-keyboard-preview',
  kbDiv: '.ui-keyboard.ui-keyboard-has-focus',
  kbDigitBtn: (d: string) =>
    `.ui-keyboard.ui-keyboard-has-focus button[data-value="${d}"]`,
  kbAcceptBtn: '.ui-keyboard.ui-keyboard-has-focus button[name="accept"]',
  kbBorrarBtn: '.ui-keyboard.ui-keyboard-has-focus button[name="bksp"]',
  homeHelloText: 'text=/Hola,\\s*/i',
};

export const homeSelectors: HomeSelectors = {
  citasMedicoGeneralCard:
    'a.card-link.mas_utilizados[ui-sref="solicitudes/seleccionGrupoHada"]',
  solicitudCitasTitle: 'h4 strong',
};