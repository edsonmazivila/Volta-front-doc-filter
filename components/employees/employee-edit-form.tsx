"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToastHelpers } from "@/components/ui/toast";
import { updateUserAction, type User } from "@/lib/services/users";
import { ChevronLeft } from "lucide-react";

const schema = z.object({
  // Account & User
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  password: z.string().optional(),
  role: z.string().min(1, "Role is required"),
  can_login: z.boolean().optional(),
  is_active: z.boolean().optional(),

  // Employment & Organization
  department_id: z.string().optional(),
  employee_number: z.string().optional(),
  job_title: z.string().optional(),
  employment_type: z.string().min(1, "Employment type is required"),
  employment_status: z.string().optional(),
  hire_date: z.string().min(1, "Hire date is required"),
  termination_date: z.string().optional(),
  manager_id: z.string().optional(),

  // Contact & Address
  phone_primary: z.string().optional(),
  phone_secondary: z.string().optional(),
  date_of_birth: z.string().optional(),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),

  // Emergency Contact
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  emergency_contact_relationship: z.string().optional(),

  // Tax & Bank
  tax_filing_status: z.string().optional(),
  tax_allowances: z.number().optional(),
  additional_tax_withholding: z.number().optional(),
  tax_exempt: z.boolean().optional(),
  bank_name: z.string().optional(),
  bank_account_type: z.string().optional(),

  // Compensation
  pay_type: z.string().optional(),
  pay_frequency: z.string().optional(),
  annual_salary: z.number().optional(),
  hourly_rate: z.number().optional(),
  overtime_rate: z.number().optional(),
  standard_hours: z.number().optional(),
});

type FormValues = z.infer<typeof schema>;

interface EmployeeEditFormProps {
  employee: User;
  companyName: string;
  departments?: { id: string; name: string }[];
}

export function EmployeeEditForm({ employee, companyName, departments }: EmployeeEditFormProps) {
  const router = useRouter();
  const toast = useToastHelpers();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canLogin, setCanLogin] = useState<boolean>(employee.can_login || true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: employee.full_name || "",
      email: employee.email || "",
      password: "",
      role: employee.role || "",
      can_login: employee.can_login || true,
      is_active: employee.is_active || true,
      department_id: employee.department_id || "",
      employee_number: employee.employee_number || "",
      job_title: employee.job_title || "",
      employment_type: employee.employment_type || "",
      employment_status: employee.employment_status || "active",
      hire_date: employee.hire_date ? employee.hire_date.split('T')[0] : "",
      termination_date: employee.termination_date ? employee.termination_date.split('T')[0] : "",
      manager_id: employee.manager_id || "",
      phone_primary: employee.phone_primary || "",
      phone_secondary: employee.phone_secondary || "",
      date_of_birth: employee.date_of_birth ? employee.date_of_birth.split('T')[0] : "",
      address_line1: employee.address_line1 || "",
      address_line2: employee.address_line2 || "",
      city: employee.city || "",
      state: employee.state || "",
      postal_code: employee.postal_code || "",
      country: employee.country || "",
      emergency_contact_name: employee.emergency_contact_name || "",
      emergency_contact_phone: employee.emergency_contact_phone || "",
      emergency_contact_relationship: employee.emergency_contact_relationship || "",
      tax_filing_status: employee.tax_filing_status || "",
      tax_allowances: employee.tax_allowances || 0,
      additional_tax_withholding: employee.additional_tax_withholding || 0,
      tax_exempt: employee.tax_exempt || false,
      bank_name: employee.bank_name || "",
      bank_account_type: employee.bank_account_type || "",
      pay_type: employee.compensation?.pay_type || "",
      pay_frequency: employee.compensation?.pay_frequency || "",
      annual_salary: employee.compensation?.annual_salary || 0,
      hourly_rate: employee.compensation?.hourly_rate || 0,
      overtime_rate: employee.compensation?.overtime_rate || 0,
      standard_hours: employee.compensation?.standard_hours || 0,
    },
  });

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      // Dynamic validation based on can_login
      if (canLogin) {
        // If can_login is true, email and password are required
        if (!values.email || values.email === '') {
          toast.error('Email is required when user can login');
          setIsSubmitting(false);
          return;
        }
        if (!values.password || values.password === '') {
          toast.error('Password is required when user can login');
          setIsSubmitting(false);
          return;
        }
      } else {
        // If can_login is false, remove email and password
        delete values.email;
        delete values.password;
      }

      const formData = new FormData();
      
      // Add all form values (excluding is_employee as requested)
      Object.entries(values).forEach(([key, value]) => {
        if (key !== 'is_employee' && value !== undefined && value !== null && value !== '') {
          formData.append(key, String(value));
        }
      });

      const result = await updateUserAction(employee.id, null, formData);
      if ("errors" in result && result.errors) {
        const errorMsg =
          result.errors._form?.[0] ||
          Object.values(result.errors).flat().join(", ");
        toast.error(errorMsg);
      } else {
        toast.success("Employee updated successfully");
        router.push("/dashboard/employees");
        router.refresh();
      }
    } catch {
      toast.error("Failed to update employee");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => router.back()}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Account & User Section */}
        <div className="bg-card border border-[var(--border)] rounded-lg p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">Account & User</h3>
            <p className="text-sm text-muted-foreground">
              Update the employee&apos;s basic information.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-medium">Full Name *</label>
              <Input
                {...register("full_name")}
                placeholder="Enter full name"
              />
              {errors.full_name && (
                <span className="text-xs text-destructive">
                  {errors.full_name.message}
                </span>
              )}
            </div>
            {canLogin && (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Email (required only if can login)</label>
                  <Input
                    type="email"
                    {...register("email")}
                    placeholder="employee@company.com"
                  />
                  {errors.email && (
                    <span className="text-xs text-destructive">
                      {errors.email.message}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Password (required only if can login)</label>
                  <Input
                    type="password"
                    {...register("password")}
                    placeholder="Enter new password"
                  />
                  {errors.password && (
                    <span className="text-xs text-destructive">
                      {errors.password.message}
                    </span>
                  )}
                </div>
              </>
            )}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Role *</label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="bg-background w-full">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="operational_manager">Operational Manager</SelectItem>
                      <SelectItem value="hr_manager">HR Manager</SelectItem>
                      <SelectItem value="payroll_manager">Payroll Manager</SelectItem>
                      <SelectItem value="system_admin">System Admin</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && (
                <span className="text-xs text-destructive">
                  {errors.role.message}
                </span>
              )}
            </div>

            {/* Can Login Checkbox */}
            <div className="flex flex-col gap-3 md:col-span-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="can_login"
                  checked={canLogin}
                  onChange={(e) => {
                    const checked = (e.target as HTMLInputElement).checked;
                    setCanLogin(checked);
                    // Update form value
                    const event = { target: { name: 'can_login', value: checked } };
                    register('can_login').onChange(event);
                  }}
                />
                <label htmlFor="can_login" className="text-sm font-medium">
                  Can login to system
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  {...register("is_active")}
                />
                <label htmlFor="is_active" className="text-sm font-medium">
                  User is active
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Employment & Organization Section */}
        <div className="bg-card border border-[var(--border)] rounded-lg p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">
              Employment & Organization
            </h3>
            <p className="text-sm text-muted-foreground">
              Update the employee&apos;s role and organizational details.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-medium">Company *</label>
              <div className="w-full border rounded-md px-3 py-2 bg-muted/20 text-muted-foreground">
                {companyName}
              </div>
              <p className="text-xs text-muted-foreground">
                Company is automatically set based on your account
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Department</label>
              <Controller
                name="department_id"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="bg-background w-full">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {(departments || []).map((d) => (
                        <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Employee Number</label>
              <Input
                {...register("employee_number")}
                placeholder="e.g., EMP001"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Job Title</label>
              <Input
                {...register("job_title")}
                placeholder="e.g., Software Engineer"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Employment Type</label>
              <Controller
                name="employment_type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="bg-background w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_time">Full Time</SelectItem>
                      <SelectItem value="part_time">Part Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="temporary">Temporary</SelectItem>
                      <SelectItem value="intern">Intern</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Employment Status</label>
              <Controller
                name="employment_status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="bg-background w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="terminated">Terminated</SelectItem>
                      <SelectItem value="on_leave">On Leave</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Hire Date</label>
              <Input type="date" {...register("hire_date")} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Termination Date</label>
              <Input type="date" {...register("termination_date")} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Manager</label>
              <Input
                {...register("manager_id")}
                placeholder="Manager ID"
              />
            </div>
          </div>
        </div>

        {/* Contact & Address Section */}
        <div className="bg-card border border-[var(--border)] rounded-lg p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">Contact & Address</h3>
            <p className="text-sm text-muted-foreground">
              Optional contact details for the employee.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Primary Phone</label>
              <Input
                type="tel"
                {...register("phone_primary")}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Secondary Phone</label>
              <Input
                type="tel"
                {...register("phone_secondary")}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-medium">Date of Birth</label>
              <Input type="date" {...register("date_of_birth")} />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-medium">Address Line 1</label>
              <Input
                {...register("address_line1")}
                placeholder="Street address"
              />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-medium">Address Line 2</label>
              <Input
                {...register("address_line2")}
                placeholder="Apartment, suite, etc."
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">City</label>
              <Input {...register("city")} placeholder="City" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">State</label>
              <Input {...register("state")} placeholder="State/Province" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Postal Code</label>
              <Input
                {...register("postal_code")}
                placeholder="ZIP/Postal code"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Country</label>
              <Input {...register("country")} placeholder="Country" />
            </div>
          </div>
        </div>

        {/* Emergency Contact Section */}
        <div className="bg-card border border-[var(--border)] rounded-lg p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">Emergency Contact</h3>
            <p className="text-sm text-muted-foreground">
              Who should we contact in an emergency?
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Name</label>
              <Input
                {...register("emergency_contact_name")}
                placeholder="Full name"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Phone</label>
              <Input
                type="tel"
                {...register("emergency_contact_phone")}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-medium">Relationship</label>
              <Input
                {...register("emergency_contact_relationship")}
                placeholder="e.g., Spouse, Parent, Sibling"
              />
            </div>
          </div>
        </div>

        {/* Tax & Bank Information Section */}
        <div className="bg-card border border-[var(--border)] rounded-lg p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">Tax & Bank Information</h3>
            <p className="text-sm text-muted-foreground">
              Tax filing and banking details.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Tax Filing Status</label>
              <Controller
                name="tax_filing_status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="bg-background w-full">
                      <SelectValue placeholder="Select filing status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="married_separate">Married Filing Separately</SelectItem>
                      <SelectItem value="head_of_household">Head of Household</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Tax Allowances</label>
              <Input
                type="number"
                step="1"
                {...register("tax_allowances")}
                placeholder="e.g., 1"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Additional Tax Withholding</label>
              <Input
                type="number"
                step="0.01"
                {...register("additional_tax_withholding")}
                placeholder="e.g., 0.00"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Tax Exempt</label>
              <Controller
                name="tax_exempt"
                control={control}
                render={({ field }) => (
                  <Select value={field.value ? "true" : "false"} onValueChange={(v) => field.onChange(v === "true")}>
                    <SelectTrigger className="bg-background w-full">
                      <SelectValue placeholder="Select tax status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">Not Exempt</SelectItem>
                      <SelectItem value="true">Tax Exempt</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Bank Name</label>
              <Input
                {...register("bank_name")}
                placeholder="e.g., Chase Bank"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Bank Account Type</label>
              <Controller
                name="bank_account_type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="bg-background w-full">
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checking">Checking</SelectItem>
                      <SelectItem value="savings">Savings</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
        </div>

        {/* Compensation Section */}
        <div className="bg-card border border-[var(--border)] rounded-lg p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">Compensation</h3>
            <p className="text-sm text-muted-foreground">
              Pay structure and hours.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Pay Type</label>
              <Controller
                name="pay_type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="bg-background w-full">
                      <SelectValue placeholder="Select pay type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="salary">Salary</SelectItem>
                      <SelectItem value="commission">Commission</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Pay Frequency</label>
              <Controller
                name="pay_frequency"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="bg-background w-full">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Biweekly</SelectItem>
                      <SelectItem value="semi_monthly">Semi-Monthly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">
                Overtime Rate (Multiplier)
              </label>
              <Input
                type="number"
                step="0.1"
                {...register("overtime_rate")}
                placeholder="e.g., 1.5"
              />
              <p className="text-xs text-muted-foreground">
                Standard is 1.5x for overtime
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">
                Standard Hours (per week)
              </label>
              <Input
                type="number"
                step="1"
                {...register("standard_hours")}
                placeholder="e.g., 40"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}

