export interface PortalElementSummary {
  tag: string;
  text: string;
  id?: string;
  name?: string;
  type?: string;
  href?: string;
  value?: string;
  placeholder?: string;
  ariaLabel?: string;
  classes?: string;
}

export interface PortalDiagnosticSnapshot {
  url: string;
  title: string;
  headings: PortalElementSummary[];
  buttons: PortalElementSummary[];
  links: PortalElementSummary[];
  selects: PortalElementSummary[];
  inputs: PortalElementSummary[];
  htmlSample: string;
  capturedAt: string;
  artifactPath?: string;
  screenshotPath?: string;
}
