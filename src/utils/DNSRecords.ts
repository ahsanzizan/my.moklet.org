"use server";

const BASE_URL = "https://api.cloudflare.com";
const authorization = {
  Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
};

interface CloudflareResponse {
  success: boolean;
  errors: string[];
  messages: string[];
  result_info: {
    page: number;
    per_page: number;
    count: number;
    total_count: number;
    total_pages: number;
  };
  result: DNSRecord[];
}

export interface DNSRecord {
  id: string;
  name: string;
  type: "A" | "CNAME";
  content: string;
  proxied: boolean;
  username: string;
  description: string;
}

export const getDNSRecordsByOwner = async (
  username: string,
  page: number = 1
) => {
  const url =
    BASE_URL +
    `/client/v4/zones/${process.env.CLOUDFLARE_DOMAIN_ZONE_ID}/dns_records?comment.contains=${username}&name=contains%3Amy&page=${page}`;

  const response = await fetch(url, {
    headers: authorization,
  }).then((res) => res.json());

  const records: DNSRecord[] = response.result.map((record: any) => ({
    id: record.id,
    name: record.name,
    type: record.type,
    content: record.content,
    proxied: record.proxied,
    username: record.comment.split(";")[0],
    description: record.comment.split(";")[1],
  }));

  return { ...response, result: records } as CloudflareResponse;
};

export const getDNSRecords = async (filter: string = "", page: number = 1) => {
  const url =
    BASE_URL +
    `/client/v4/zones/${process.env.CLOUDFLARE_DOMAIN_ZONE_ID}/dns_records?search=${filter}&page=${page}&name=contains%3Amy`;

  const response = await fetch(url, {
    headers: authorization,
  }).then((res) => res.json());

  const records = response.result.map((record: any) => ({
    id: record.id,
    name: record.name,
    type: record.type,
    content: record.content,
    proxied: record.proxied,
    username: record.comment.split(";")[0],
    description: record.comment.split(";")[1],
  }));

  return { ...response, result: records };
};

interface DNSRecordProps {
  content: string;
  name: string;
  type: "A" | "CNAME";
  proxied: boolean;
  username: string;
  description: string;
}

export const createDNSRecord = async ({
  content,
  description,
  name,
  proxied,
  type,
  username,
}: DNSRecordProps) => {
  const url =
    BASE_URL +
    `/client/v4/zones/${process.env.CLOUDFLARE_DOMAIN_ZONE_ID}/dns_records`;

  const data = {
    content,
    name,
    proxied,
    type,
    comment: username + ";" + description,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      ...authorization,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).then((res) => res.json());

  return response;
};

export const updateDNSRecord = async (
  id: string,
  { content, description, name, proxied, type, username }: DNSRecordProps
) => {
  const url =
    BASE_URL +
    `/client/v4/zones/${process.env.CLOUDFLARE_DOMAIN_ZONE_ID}/dns_records/${id}`;

  const data = {
    content,
    name,
    proxied,
    type,
    comment: username + ";" + description,
  };

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      ...authorization,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).then((res) => res.json());

  return response;
};

export const deleteDNSRecord = async (id: string) => {
  const url =
    BASE_URL +
    `/client/v4/zones/${process.env.CLOUDFLARE_DOMAIN_ZONE_ID}/dns_records/${id}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: authorization,
  }).then((res) => res.json());

  return response;
};