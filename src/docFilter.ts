import { Document, DocFilterOptions } from './types';

/**
 * Filters a list of documents by employee ID and/or organization ID.
 *
 * @param docs - Array of documents to filter.
 * @param options - Filter criteria: employeeId and/or orgId.
 * @returns Documents that match all provided filter criteria.
 */
export function filterDocuments(docs: Document[], options: DocFilterOptions): Document[] {
  return docs.filter((doc) => {
    if (options.employeeId !== undefined && doc.employee?.id !== options.employeeId) {
      return false;
    }
    if (options.orgId !== undefined && doc.org?.id !== options.orgId) {
      return false;
    }
    return true;
  });
}
