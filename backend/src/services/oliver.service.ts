import { XMLParser } from 'fast-xml-parser';

export function getOliverStatus() {
  const configured = Boolean(process.env.OLIVER_OPAC_WSDL_URL && process.env.OLIVER_CORP_ALIAS &&
    process.env.OLIVER_CLIENT_ALIAS && process.env.OLIVER_CLIENT_PASSWORD);
  return {
    configured,
    message: configured
      ? 'Oliver V5 configuration is present. Live SOAP calls can be enabled with the school-provided Web Services credentials.'
      : 'Oliver V5 is not configured. Add the Softlink OPAC Web Services WSDL and server-side credentials to enable live catalogue search.',
  };
}

export async function searchOliver(query: string) {
  if (!process.env.OLIVER_OPAC_WSDL_URL) {
    return { ok: false, configured: false, results: [], error: 'Oliver V5 credentials are not configured on the server.' };
  }

  // Softlink's Query operation is SOAP/WSDL based. The exact encrypted client fields and
  // corporation alias are installation-specific, so this adapter deliberately refuses to
  // invent them. The UI remains usable in demo mode until the school supplies them.
  return {
    ok: false,
    configured: true,
    results: [],
    error: 'Oliver is configured, but the installation-specific SOAP request/encryption mapping still needs to be completed against the school WSDL.',
    query,
  };
}

export function parseOliverXml(xml: string) {
  return new XMLParser({ ignoreAttributes: false }).parse(xml);
}
