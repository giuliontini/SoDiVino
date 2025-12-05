export interface MenuSession {
  id: string;
  user_id: string;
  restaurant_name: string | null;
  parsed_list_id: string | null;
  upload_reference: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export type MenuSessionInput = {
  restaurant_name?: string | null;
  parsed_list_id?: string | null;
  upload_reference?: string | null;
  status?: string;
};

export function normalizeMenuSessionInput(input: MenuSessionInput): Required<MenuSessionInput> {
  return {
    restaurant_name: typeof input.restaurant_name === "string" ? input.restaurant_name.trim() || null : null,
    parsed_list_id: typeof input.parsed_list_id === "string" ? input.parsed_list_id.trim() || null : null,
    upload_reference: typeof input.upload_reference === "string" ? input.upload_reference.trim() || null : null,
    status: typeof input.status === "string" && input.status.trim().length > 0 ? input.status.trim() : "parsed",
  };
}
