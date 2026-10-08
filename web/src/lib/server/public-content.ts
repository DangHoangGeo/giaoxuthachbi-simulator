import "server-only";
import pointer from "../../../content/current.json";
import release from "../../../content/release.json";
import { resolvePublicContent } from "./public-validation";

// These are the only public content inputs. No caller path, fetch or repository traversal.
export function readPublicContent() {
  return resolvePublicContent(pointer, release);
}
