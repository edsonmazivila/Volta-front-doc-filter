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
import { createUserAction } from "@/lib/services/users";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";
import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";

const schema = z.object({
  // Account & User
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal('')),
  role: z.string().min(1, "Role is required"),
  can_login: z.boolean().optional(),
  is_active: z.boolean().optional(),
  company_id: z.string().optional(),

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
  tax_allowances: z.coerce.number().optional(),
  additional_tax_withholding: z.coerce.number().optional(),
  tax_exempt: z.boolean().optional(),
  bank_name: z.string().optional(),
  bank_account_type: z.string().optional(),

  // Compensation
  pay_type: z.string().optional(),
  pay_frequency: z.string().optional(),
  annual_salary: z.coerce.number().optional(),
  hourly_rate: z.coerce.number().optional(),
  overtime_rate: z.coerce.number().optional(),
  standard_hours: z.coerce.number().optional(),
});

type FormValues = z.infer<typeof schema>;

interface EmployeeCreateFormProps {
  companyName: string;
  departments: { id: string; name: string }[];
  companies?: { id: string; name: string }[] | null;
  isOrgAdmin?: boolean;
}

export function EmployeeCreateForm({ companyName, departments, companies, isOrgAdmin }: EmployeeCreateFormProps) {
	const router = useRouter();
	const toast = useToastHelpers();
	const { i18n } = useLingui();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [canLogin, setCanLogin] = useState<boolean>(true);
	const [showPassword, setShowPassword] = useState(false);
	const [validationErrors, setValidationErrors] = useState<string[]>([]);
	const [selectedCompanyId, setSelectedCompanyId] = useState<string>(
		companies && companies.length > 0 ? companies[0].id : ''
	);

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
      can_login: true,
      is_active: true,
      company_id: "",
      department_id: "",
      employee_number: "",
      job_title: "",
      employment_type: "",
      employment_status: "active",
      hire_date: "",
      termination_date: "",
      manager_id: "",
      phone_primary: "",
      phone_secondary: "",
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
      tax_filing_status: "",
      tax_allowances: 0,
      additional_tax_withholding: 0,
      tax_exempt: false,
      bank_name: "",
      bank_account_type: "",
      pay_type: "",
      pay_frequency: "",
      annual_salary: 0,
      hourly_rate: 0,
    },
  });

	async function onSubmit(values: FormValues) {
		setIsSubmitting(true);
		setValidationErrors([]);

		try {
			// Dynamic validation based on can_login
			if (canLogin) {
				if (!values.email?.trim()) {
					const error = i18n._(msg`Please enter an email address. Email is required when user can login.`);
					setValidationErrors([error]);
					toast.error(error);
					setIsSubmitting(false);
					return;
				}
				if (!values.password?.trim()) {
					const error = i18n._(msg`Please enter a password. Password is required when user can login.`);
					setValidationErrors([error]);
					toast.error(error);
					setIsSubmitting(false);
					return;
				}
			} else {
				delete values.email;
				delete values.password;
			}

			const formData = new FormData();

			// Add unified flags for employee creation
			formData.append('is_employee', 'true');
			formData.append('can_login', String(canLogin));
			formData.append('is_active', 'true');

			// For organization admin, add selected company_id
			if (isOrgAdmin && selectedCompanyId) {
				formData.append('company_id', selectedCompanyId);
			}

			// Add all form values, filtering out empty strings and special keys
			Object.entries(values).forEach(([key, value]) => {
				const shouldInclude =
					key !== 'is_employee' &&
					key !== 'is_active' &&
					value !== undefined &&
					value !== null &&
					value !== '';

				if (shouldInclude) {
					formData.append(key, String(value));
				}
			});

			const result = await createUserAction(null, formData);

			if ("errors" in result && result.errors) {
				// Show validation errors to the user
				if (result.errors._form) {
					const errorMsg = result.errors._form[0];
					setValidationErrors([errorMsg]);
					toast.error(errorMsg);
				} else {
					// Format field-specific errors with better messages
					const errorEntries = Object.entries(result.errors);
					const errorMessages = errorEntries
						.map(([field, messages]) => {
							if (Array.isArray(messages) && messages.length > 0) {
								const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
								return `${fieldName}: ${messages[0]}`;
							}
							return null;
						})
						.filter((msg): msg is string => msg !== null);

					if (errorMessages.length > 0) {
						console.error('[FORM] Validation errors:', errorMessages);
						setValidationErrors(errorMessages);
						// Show the first error to user
						toast.error(errorMessages[0]);
						// If multiple errors, show a hint
						if (errorMessages.length > 1) {
							setTimeout(() => {
								toast.error(i18n._(msg`${errorMessages.length - 1} more validation error(s). See below for details.`));
							}, 300);
						}
					} else {
						const error = i18n._(msg`Please check all required fields and try again.`);
						setValidationErrors([error]);
						toast.error(error);
					}
				}
			} else {
				setValidationErrors([]);
				toast.success(i18n._(msg`Employee created successfully!`));
				router.push("/dashboard/employees");
				router.refresh();
			}
		} catch (error) {
			console.error('[FORM] Error creating employee:', error);
			const errorMsg = error instanceof Error ? error.message : i18n._(msg`An unexpected error occurred. Please try again.`);
			setValidationErrors([errorMsg]);
			toast.error(errorMsg);
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
					{i18n._(msg`Back`)}
				</Button>
			</div>

			{validationErrors.length > 0 && (
				<div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
					<div className="flex items-start gap-3">
						<div className="flex-shrink-0 w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center mt-0.5">
							<span className="text-destructive text-sm font-bold">!</span>
						</div>
						<div className="flex-1">
							<h4 className="text-sm font-semibold text-destructive mb-2">
								{validationErrors.length === 1
									? i18n._(msg`Please fix the following error:`)
									: i18n._(msg`Please fix the following errors:`)}
							</h4>
							<ul className="list-disc list-inside space-y-1">
								{validationErrors.map((error, index) => (
									<li key={index} className="text-sm text-destructive/90">{error}</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			)}

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Account & User Section */}
        <div className="bg-card border border-[var(--border)] rounded-lg p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">{i18n._(msg`Account & User`)}</h3>
            <p className="text-sm text-muted-foreground">
              {i18n._(msg`Create the user account that will be linked to the employee.`)}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-medium">{i18n._(msg`Full Name`)} *</label>
              <Input
                {...register("full_name")}
                placeholder={i18n._(msg`Enter full name`)}
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
                  <label className="text-sm font-medium">{i18n._(msg`Email`)} *</label>
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
                  <label className="text-sm font-medium">{i18n._(msg`Password`)} *</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      {...register("password")}
                      placeholder={i18n._(msg`Min 8 characters`)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <span className="text-xs text-destructive">
                      {errors.password.message}
                    </span>
                  )}
                </div>
              </>
            )}
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-medium">{i18n._(msg`Role`)} *</label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder={i18n._(msg`Select role`)} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">{i18n._(msg`Employee`)}</SelectItem>
                      <SelectItem value="operational_manager">
                        {i18n._(msg`Operational Manager`)}
                      </SelectItem>
                      <SelectItem value="hr_manager">{i18n._(msg`HR Manager`)}</SelectItem>
                      <SelectItem value="payroll_manager">
                        {i18n._(msg`Payroll Manager`)}
                      </SelectItem>
                      <SelectItem value="system_admin">{i18n._(msg`System Admin`)}</SelectItem>
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

            {/* Can Login Toggle with Description */}
            <div className="md:col-span-2">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Controller
                    name="can_login"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="can_login"
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          setCanLogin(checked as boolean);
                        }}
                        className="mt-1"
                      />
                    )}
                  />
                  <div className="flex-1">
                    <label htmlFor="can_login" className="text-sm font-medium text-blue-900 dark:text-blue-300 cursor-pointer">
                      {i18n._(msg`Allow system login`)}
                    </label>
                    <p className="text-xs text-blue-800 dark:text-blue-400 mt-1">
                      {canLogin 
                        ? <Trans>User will be able to log in to the system. Email and password are required.</Trans>
                        : <Trans>User will exist in the system but won&apos;t be able to log in. Useful for contractors or historical records.</Trans>
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Employment & Organization Section */}
        <div className="bg-card border border-[var(--border)] rounded-lg p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">
              {i18n._(msg`Employment & Organization`)}
            </h3>
            <p className="text-sm text-muted-foreground">
              {i18n._(msg`Link the employee to the company and define their role.`)}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-medium ">{i18n._(msg`Company`)} *</label>
              {isOrgAdmin && companies && companies.length > 0 ? (
                <>
                  <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                    <SelectTrigger className="bg-background w-full">
                      <SelectValue placeholder={i18n._(msg`Select company`)} />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {i18n._(msg`Select the company for this employee`)}
                  </p>
                </>
              ) : (
                <>
                  <div className="w-full border rounded-md px-3 py-2 bg-muted/20 text-muted-foreground">
                    {companyName}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {i18n._(msg`Company is automatically set based on your account`)}
                  </p>
                </>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">{i18n._(msg`Department`)}</label>
              <Controller
                name="department_id"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="bg-background w-full">
                      <SelectValue placeholder={i18n._(msg`Select department`)} />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => (
                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.department_id && (
                <span className="text-xs text-destructive">
                  {errors.department_id.message}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">{i18n._(msg`Employee Number`)}</label>
              <Input
                {...register("employee_number")}
                placeholder={i18n._(msg`e.g., EMP001`)}
              />
              {errors.employee_number && (
                <span className="text-xs text-destructive">
                  {errors.employee_number.message}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">{i18n._(msg`Job Title`)}</label>
              <Input
                {...register("job_title")}
                placeholder={i18n._(msg`e.g., Software Engineer`)}
              />
              {errors.job_title && (
                <span className="text-xs text-destructive">
                  {errors.job_title.message}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">{i18n._(msg`Employment Type`)} *</label>
              <Controller
                name="employment_type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="bg-background w-full">
                      <SelectValue placeholder={i18n._(msg`Select type`)} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_time">{i18n._(msg`Full Time`)}</SelectItem>
                      <SelectItem value="part_time">{i18n._(msg`Part Time`)}</SelectItem>
                      <SelectItem value="contract">{i18n._(msg`Contract`)}</SelectItem>
                      <SelectItem value="temporary">{i18n._(msg`Temporary`)}</SelectItem>
                      <SelectItem value="intern">{i18n._(msg`Intern`)}</SelectItem>
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
              <label className="text-sm font-medium">{i18n._(msg`Hire Date`)} *</label>
              <Input type="date" {...register("hire_date")} />
              {errors.hire_date && (
                <span className="text-xs text-destructive">
                  {errors.hire_date.message}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">
                {i18n._(msg`Termination Date`)} <span className="text-muted-foreground font-normal text-xs">({i18n._(msg`Optional`)})</span>
              </label>
              <Input type="date" {...register("termination_date")} />
              {errors.termination_date && (
                <span className="text-xs text-destructive">
                  {errors.termination_date.message}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Contact & Address Section */}
        <div className="bg-card border border-[var(--border)] rounded-lg p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">{i18n._(msg`Contact & Address`)}</h3>
            <p className="text-sm text-muted-foreground">
              {i18n._(msg`Optional contact details for the employee.`)}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">{i18n._(msg`Primary Phone`)}</label>
              <Input
                type="tel"
                {...register("phone_primary")}
                placeholder="+1 (555) 000-0000"
              />
              {errors.phone_primary && (
                <span className="text-xs text-destructive">
                  {errors.phone_primary.message}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">{i18n._(msg`Secondary Phone`)}</label>
              <Input
                type="tel"
                {...register("phone_secondary")}
                placeholder="+1 (555) 000-0000"
              />
              {errors.phone_secondary && (
                <span className="text-xs text-destructive">
                  {errors.phone_secondary.message}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-medium">{i18n._(msg`Date of Birth`)}</label>
              <Input type="date" {...register("date_of_birth")} />
              {errors.date_of_birth && (
                <span className="text-xs text-destructive">
                  {errors.date_of_birth.message}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-medium">{i18n._(msg`Address Line 1`)}</label>
              <Input
                {...register("address_line1")}
                placeholder={i18n._(msg`Street address`)}
              />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-medium">{i18n._(msg`Address Line 2`)}</label>
              <Input
                {...register("address_line2")}
                placeholder={i18n._(msg`Apartment, suite, etc.`)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">{i18n._(msg`City`)}</label>
              <Input {...register("city")} placeholder={i18n._(msg`City`)} />
              {errors.city && (
                <span className="text-xs text-destructive">
                  {errors.city.message}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">{i18n._(msg`State`)}</label>
              <Input {...register("state")} placeholder={i18n._(msg`State/Province`)} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">{i18n._(msg`Postal Code`)}</label>
              <Input
                {...register("postal_code")}
                placeholder={i18n._(msg`ZIP/Postal code`)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">{i18n._(msg`Country`)}</label>
              <Input {...register("country")} placeholder={i18n._(msg`Country`)} />
            </div>
          </div>
        </div>

        {/* Emergency Contact Section */}
        <div className="bg-card border border-[var(--border)] rounded-lg p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">{i18n._(msg`Emergency Contact`)}</h3>
            <p className="text-sm text-muted-foreground">
              {i18n._(msg`Who should we contact in an emergency?`)}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">{i18n._(msg`Name`)}</label>
              <Input
                {...register("emergency_contact_name")}
                placeholder={i18n._(msg`Full name`)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">{i18n._(msg`Phone`)}</label>
              <Input
                type="tel"
                {...register("emergency_contact_phone")}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-medium">{i18n._(msg`Relationship`)}</label>
              <Input
                {...register("emergency_contact_relationship")}
                placeholder={i18n._(msg`e.g., Spouse, Parent, Sibling`)}
              />
            </div>
          </div>
        </div>

        {/* Tax & Bank Section */}
        <div className="bg-card border border-[var(--border)] rounded-lg p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">{i18n._(msg`Tax & Bank Information`)}</h3>
            <p className="text-sm text-muted-foreground">
              {i18n._(msg`Tax filing and banking details.`)}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">{i18n._(msg`Tax Filing Status`)}</label>
              <Controller
                name="tax_filing_status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="bg-background w-full">
                      <SelectValue placeholder={i18n._(msg`Select filing status`)} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">{i18n._(msg`Single`)}</SelectItem>
                      <SelectItem value="married">{i18n._(msg`Married`)}</SelectItem>
                      <SelectItem value="married_separate">{i18n._(msg`Married Filing Separately`)}</SelectItem>
                      <SelectItem value="head_of_household">{i18n._(msg`Head of Household`)}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">{i18n._(msg`Tax Exempt`)}</label>
              <Controller
                name="tax_exempt"
                control={control}
                render={({ field }) => (
                  <Select value={field.value ? "true" : "false"} onValueChange={(v) => field.onChange(v === "true")}>
                    <SelectTrigger className="bg-background w-full">
                      <SelectValue placeholder={i18n._(msg`Select tax status`)} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">{i18n._(msg`Not Exempt`)}</SelectItem>
                      <SelectItem value="true">{i18n._(msg`Tax Exempt`)}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">{i18n._(msg`Bank Name`)}</label>
              <Input
                {...register("bank_name")}
                placeholder={i18n._(msg`e.g., Chase Bank`)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">{i18n._(msg`Bank Account Type`)}</label>
              <Controller
                name="bank_account_type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="bg-background w-full">
                      <SelectValue placeholder={i18n._(msg`Select account type`)} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checking">{i18n._(msg`Checking`)}</SelectItem>
                      <SelectItem value="savings">{i18n._(msg`Savings`)}</SelectItem>
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
            <h3 className="text-lg font-semibold mb-1">{i18n._(msg`Compensation`)}</h3>
            <p className="text-sm text-muted-foreground">
              {i18n._(msg`Pay structure and hours.`)}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">{i18n._(msg`Pay Type`)}</label>
              <Controller
                name="pay_type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="bg-background w-full">
                      <SelectValue placeholder={i18n._(msg`Select pay type`)} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">{i18n._(msg`Hourly`)}</SelectItem>
                      <SelectItem value="salary">{i18n._(msg`Salary`)}</SelectItem>
                      <SelectItem value="commission">{i18n._(msg`Commission`)}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">{i18n._(msg`Pay Frequency`)}</label>
              <Controller
                name="pay_frequency"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="bg-background w-full">
                      <SelectValue placeholder={i18n._(msg`Select frequency`)} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">{i18n._(msg`Weekly`)}</SelectItem>
                      <SelectItem value="biweekly">{i18n._(msg`Biweekly`)}</SelectItem>
                      <SelectItem value="semi_monthly">{i18n._(msg`Semi-Monthly`)}</SelectItem>
                      <SelectItem value="monthly">{i18n._(msg`Monthly`)}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">{i18n._(msg`Annual Salary`)}</label>
              <Input
                type="number"
                step="1"
                {...register("annual_salary")}
                placeholder={i18n._(msg`e.g., 48000`)}
              />
              {errors.annual_salary && (
                <span className="text-xs text-destructive">
                  {errors.annual_salary.message}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">{i18n._(msg`Hourly Rate`)}</label>
              <Input
                type="number"
                step="0.01"
                {...register("hourly_rate")}
                placeholder={i18n._(msg`e.g., 25.00`)}
              />
              {errors.hourly_rate && (
                <span className="text-xs text-destructive">
                  {errors.hourly_rate.message}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">
                {i18n._(msg`Overtime Rate (Multiplier)`)}
              </label>
              <Input
                type="number"
                step="0.1"
                {...register("overtime_rate")}
                placeholder={i18n._(msg`e.g., 1.5`)}
              />
              <p className="text-xs text-muted-foreground">
                {i18n._(msg`Standard is 1.5x for overtime`)}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">
                {i18n._(msg`Standard Hours (per week)`)}
              </label>
              <Input
                type="number"
                step="1"
                {...register("standard_hours")}
                placeholder={i18n._(msg`e.g., 40`)}
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
            {i18n._(msg`Cancel`)}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? i18n._(msg`Creating...`) : i18n._(msg`Create Employee`)}
          </Button>
        </div>
      </form>
    </div>
  );
}
