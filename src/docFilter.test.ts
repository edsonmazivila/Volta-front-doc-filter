import { filterDocuments } from './docFilter';
import { Document } from './types';

const docs: Document[] = [
  { id: '1', title: 'Contract A', employee: { id: 'e1', name: 'Alice' }, org: { id: 'o1', name: 'Acme' } },
  { id: '2', title: 'Contract B', employee: { id: 'e2', name: 'Bob' }, org: { id: 'o1', name: 'Acme' } },
  { id: '3', title: 'Report X', employee: { id: 'e1', name: 'Alice' }, org: { id: 'o2', name: 'Globex' } },
  { id: '4', title: 'Report Y', org: { id: 'o2', name: 'Globex' } },
  { id: '5', title: 'Memo Z', employee: { id: 'e3', name: 'Carol' } },
];

describe('filterDocuments', () => {
  it('returns all documents when no filter options are provided', () => {
    expect(filterDocuments(docs, {})).toHaveLength(docs.length);
  });

  it('filters documents by employeeId', () => {
    const result = filterDocuments(docs, { employeeId: 'e1' });
    expect(result).toHaveLength(2);
    expect(result.map((d) => d.id)).toEqual(['1', '3']);
  });

  it('filters documents by orgId', () => {
    const result = filterDocuments(docs, { orgId: 'o1' });
    expect(result).toHaveLength(2);
    expect(result.map((d) => d.id)).toEqual(['1', '2']);
  });

  it('filters documents by both employeeId and orgId', () => {
    const result = filterDocuments(docs, { employeeId: 'e1', orgId: 'o1' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('returns empty array when no documents match', () => {
    const result = filterDocuments(docs, { employeeId: 'e99' });
    expect(result).toHaveLength(0);
  });

  it('excludes documents without an employee when filtering by employeeId', () => {
    const result = filterDocuments(docs, { employeeId: 'e1' });
    expect(result.every((d) => d.employee?.id === 'e1')).toBe(true);
  });

  it('excludes documents without an org when filtering by orgId', () => {
    const result = filterDocuments(docs, { orgId: 'o2' });
    expect(result).toHaveLength(2);
    expect(result.map((d) => d.id)).toEqual(['3', '4']);
  });

  it('returns an empty array when the input list is empty', () => {
    expect(filterDocuments([], { employeeId: 'e1' })).toHaveLength(0);
  });
});
