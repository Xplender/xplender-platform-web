import { listRegisteredProducts } from "./actions";
import { SettingsClient } from "./SettingsClient";

export default async function SettingsPage() {
  const products = await listRegisteredProducts().catch(() => []);
  return <SettingsClient products={products} />;
}
