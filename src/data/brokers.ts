import brokerJson from "../../active-broker-list.json";

export interface Broker {
  key: string;
  name: string;
  url: string;
  target?: string;
}

export const brokers: Broker[] = Object.entries(brokerJson).map(([key, v]) => ({
  key,
  name: (v as { name: string; url: string; target?: string }).name,
  url: (v as { name: string; url: string; target?: string }).url,
  target: (v as { name: string; url: string; target?: string }).target,
}));
