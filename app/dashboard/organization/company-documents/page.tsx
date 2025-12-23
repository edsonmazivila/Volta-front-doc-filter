import { getOrganizationCompanyDocuments } from '@/lib/services/organization-data';
import { getAllCompanies } from '@/lib/services/companies';
import { Card } from '@/components/dashboard/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default async function OrganizationCompanyDocumentsPage({
  searchParams
}: {
  searchParams: Promise<{ company?: string; type?: string }>;
}) {
  const params = await searchParams;
  const companyId = params.company;
  const documentType = params.type;

  const [documentsResult, companiesResult] = await Promise.all([
    getOrganizationCompanyDocuments({ company_id: companyId, document_type: documentType }),
    getAllCompanies()
  ]);

  const documents = documentsResult.data;
  const companies = companiesResult.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">All Company Documents</h1>
      </div>

      {/* Summary Card */}
      <Card>
        <p className="text-sm text-muted-foreground">Total Company Documents</p>
        <div className="text-2xl font-bold mt-2">{documents.length}</div>
      </Card>

      {/* Filters */}
      <Card>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Company</label>
            <select className="w-full px-3 py-2 border rounded-lg" defaultValue={companyId || 'all'}>
              <option value="all">All Companies</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Document Type</label>
            <select className="w-full px-3 py-2 border rounded-lg" defaultValue={documentType || 'all'}>
              <option value="all">All Types</option>
              <option value="business_license">Business License</option>
              <option value="tax_certificate">Tax Certificate</option>
              <option value="insurance">Insurance</option>
              <option value="contract">Contract</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Document Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Upload Date</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No company documents available
                </TableCell>
              </TableRow>
            ) : (
              documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.company_name}</TableCell>
                  <TableCell>{doc.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {doc.document_type.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>
                    {doc.expiry_date ? new Date(doc.expiry_date).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">Corporate</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild>
                      <a href={doc.file_path} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
