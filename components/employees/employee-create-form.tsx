"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToastHelpers } from "@/components/ui/toast";
import { createEmployeeAction } from "@/lib/services/employees";
import { ChevronLeft } from "lucide-react";

const schema = z.object({
  // Account & User
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.string().min(1, "Role is required"),

  // Employment & Organization
  department: z.string().optional(),
  employee_number: z.string().optional(),
  job_title: z.string().optional(),
  employment_type: z.string().min(1, "Employment type is required"),
  hire_date: z.string().min(1, "Hire date is required"),

  // Contact & Address
  primary_phone: z.string().optional(),
  secondary_phone: z.string().optional(),
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

  // Compensation
  pay_type: z.string().optional(),
  pay_frequency: z.string().optional(),
  overtime_rate: z.string().optional(),
  standard_hours: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface EmployeeCreateFormProps {
  companyName: string;
  departments: { id: string; name: string }[];
}

export function EmployeeCreateForm({ companyName, departments }: EmployeeCreateFormProps) {
  const router = useRouter();
  const toast = useToastHelpers();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      role: "",
      department: "",
      employee_number: "",
      job_title: "",
      employment_type: "",
      hire_date: "",
      primary_phone: "",
      secondary_phone: "",
      date_of_birth: "",
      address_line1: "",
      address_line2: "",
      city: "",
      state: "",
      postal_code: "",
      country: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      emergency_contact_relationship: "",
      pay_type: "",
      pay_frequency: "",
      overtime_rate: "",
      standard_hours: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('full_name', values.full_name);
      Object.entries(values).forEach(([key, value]) => {
        if (key === 'full_name') return;
        if (value) formData.append(key, String(value));
      });

      const result = await createEmployeeAction(null, formData);
      if ("errors" in result && result.errors) {
        const errorMsg =
          result.errors._form?.[0] ||
          Object.values(result.errors).flat().join(", ");
        toast.error(errorMsg);
      } else {
        toast.success("Employee created successfully");
        router.push("/dashboard/employees");
        router.refresh();
      }
    } catch {
      toast.error("Failed to create employee");
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
              Create the user account that will be linked to the employee.
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
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Email *</label>
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
              <label className="text-sm font-medium">Password *</label>
              <Input
                type="password"
                {...register("password")}
                placeholder="Min 8 characters"
              />
              {errors.password && (
                <span className="text-xs text-destructive">
                  {errors.password.message}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-medium">Role *</label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="operational_manager">
                        Operational Manager
                      </SelectItem>
                      <SelectItem value="hr_manager">HR Manager</SelectItem>
                      <SelectItem value="payroll_manager">
                        Payroll Manager
                      </SelectItem>
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
          </div>
        </div>

        {/* Employment & Organization Section */}
        <div className="bg-card border border-[var(--border)] rounded-lg p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">
              Employment & Organization
            </h3>
            <p className="text-sm text-muted-foreground">
              Link the employee to the company and define their role.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-medium">Company *</label>
              <div className="w-full border rounded-md px-3 py-2 bg-muted/20 text-foreground">
                {companyName}
              </div>
              <p className="text-xs text-muted-foreground">
                Company is automatically set based on your account
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Department</label>
              <Controller
                name="department"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="bg-background w-full">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => (
                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
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
              <label className="text-sm font-medium">Employment Type *</label>
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
              {errors.employment_type && (
                <span className="text-xs text-destructive">
                  {errors.employment_type.message}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Hire Date *</label>
              <Input type="date" {...register("hire_date")} />
              {errors.hire_date && (
                <span className="text-xs text-destructive">
                  {errors.hire_date.message}
                </span>
              )}
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
                {...register("primary_phone")}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Secondary Phone</label>
              <Input
                type="tel"
                {...register("secondary_phone")}
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
            {isSubmitting ? "Creating..." : "Create Employee"}
          </Button>
        </div>
      </form>
    </div>
  );
}
