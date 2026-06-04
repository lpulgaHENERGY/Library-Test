/**
 * Types and mapper for the `lpulga_libraryitem` Dataverse table.
 *
 * Three layers:
 *   LibraryItemEntity  — raw OData field names returned by /_api/lpulga_libraryitems
 *   LibraryItem        — clean domain shape consumed by UI components
 *   mapLibraryItem()   — converts an entity to the domain type with safe defaults
 */

// ---------------------------------------------------------------------------
// Raw OData entity (field names exactly as Dataverse returns them)
// ---------------------------------------------------------------------------

export interface LibraryItemEntity {
  /** Primary key — guid */
  lpulga_libraryitemid: string;
  /** Display title of the library item */
  lpulga_name: string | null;
  /** Author name */
  lpulga_author: string | null;
  /** Long-form excerpt / description */
  lpulga_excerpt: string | null;
  /** Unsplash photo ID used to build the cover image URL */
  lpulga_imgid: string | null;
  /** URL-safe routing key (e.g. for /catalog/item/<externalId>) */
  lpulga_externalid: string | null;
}

// ---------------------------------------------------------------------------
// Domain type (used by CatalogCard and the rest of the UI)
// ---------------------------------------------------------------------------

export interface LibraryItem {
  /** Dataverse record GUID — use as React key */
  id: string;
  title: string;
  author: string;
  /** Unsplash photo ID — pass to the imageUrl helper in CatalogCard */
  imgId: string;
  excerpt: string;
  /** URL-safe slug for item detail routing */
  externalId: string;
}

// ---------------------------------------------------------------------------
// Mapper
// ---------------------------------------------------------------------------

/**
 * Converts a raw Dataverse OData entity into the clean UI domain type.
 * Null/undefined fields fall back to empty strings so components never
 * receive null (guards against column-permission-silenced fields).
 */
export function mapLibraryItem(entity: LibraryItemEntity): LibraryItem {
  return {
    id:         entity.lpulga_libraryitemid,
    title:      entity.lpulga_name       ?? '',
    author:     entity.lpulga_author     ?? '',
    imgId:      entity.lpulga_imgid      ?? '',
    excerpt:    entity.lpulga_excerpt    ?? '',
    externalId: entity.lpulga_externalid ?? '',
  };
}
