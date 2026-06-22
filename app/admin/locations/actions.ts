"use server";

import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function addCountry(name: string, code: string) {
  const admin = createSupabaseAdmin();
  const { error } = await admin.from("countries").insert({ name, code });
  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteCountry(id: string) {
  const admin = createSupabaseAdmin();
  const { error } = await admin.from("countries").delete().eq("id", id);
  if (error) return { error: error.message };
  return { success: true };
}

export async function addState(name: string, country_id: string) {
  const admin = createSupabaseAdmin();
  const { error } = await admin.from("states").insert({ name, country_id });
  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteState(id: string) {
  const admin = createSupabaseAdmin();
  const { error } = await admin.from("states").delete().eq("id", id);
  if (error) return { error: error.message };
  return { success: true };
}
