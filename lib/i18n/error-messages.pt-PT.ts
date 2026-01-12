/**
 * Mensagens de Erro - Português (Portugal)
 * 
 * Mapeia códigos de erro do backend para mensagens amigáveis em Português (Portugal).
 * Este ficheiro contém todos os códigos de erro que podem ser retornados pelo backend.
 */

export const errorMessagesPT = {
  // ============================================================================
  // ERROS DE AUTENTICAÇÃO
  // ============================================================================
  INVALID_CREDENTIALS: "Email ou palavra-passe inválidos",
  SESSION_EXPIRED: "A sua sessão expirou. Por favor, inicie sessão novamente",
  TOKEN_EXPIRED: "A sua autenticação expirou",
  TOKEN_INVALID: "Token de autenticação inválido",
  INSUFFICIENT_PERMISSIONS: "Não tem permissão para esta ação",
  MFA_REQUIRED: "É obrigatória a autenticação de dois fatores",
  MFA_INVALID: "Código de autenticação inválido",
  UNAUTHORIZED: "Acesso não autorizado",
  
  // ============================================================================
  // ERROS DE ORGANIZAÇÃO
  // ============================================================================
  ORGANIZATION_INACTIVE: "A sua organização está inativa. Contacte o suporte",
  ORGANIZATION_SUSPENDED: "A sua organização foi suspensa. Contacte o suporte",
  ORGANIZATION_NOT_APPROVED: "O seu registo está pendente de aprovação",
  ORGANIZATION_REJECTED: "O seu registo foi rejeitado. Contacte o suporte",
  ORGANIZATION_NOT_FOUND: "Organização não encontrada",
  
  // ============================================================================
  // ERROS DE UTILIZADOR
  // ============================================================================
  USER_INACTIVE: "A sua conta foi desativada",
  USER_NOT_FOUND: "Utilizador não encontrado",
  USER_ALREADY_EXISTS: "Utilizador já existe",
  EMPLOYEE_RECORD_REQUIRED: "É necessário um registo de funcionário",
  EMAIL_ALREADY_IN_USE: "O endereço de email já está em uso",
  
  // ============================================================================
  // ERROS DE RECURSOS
  // ============================================================================
  RESOURCE_NOT_FOUND: "Recurso não encontrado",
  DUPLICATE_RESOURCE: "Este registo já existe",
  RESOURCE_IN_USE: "Este recurso está atualmente em uso e não pode ser eliminado",
  
  // ============================================================================
  // ERROS DE VALIDAÇÃO
  // ============================================================================
  VALIDATION_ERROR: "Por favor, verifique os campos abaixo",
  INVALID_INPUT: "Dados inválidos",
  MISSING_PARAMETER: "Campo obrigatório não preenchido",
  INVALID_FORMAT: "Formato inválido",
  INVALID_DATE_RANGE: "Intervalo de datas inválido",
  INVALID_EMAIL: "Endereço de email inválido",
  INVALID_PHONE: "Número de telefone inválido",
  PASSWORD_TOO_WEAK: "A palavra-passe é demasiado fraca",
  PASSWORDS_DO_NOT_MATCH: "As palavras-passe não coincidem",
  
  // ============================================================================
  // ERROS DE FICHEIROS
  // ============================================================================
  FILE_TOO_BIG: "O ficheiro é demasiado grande",
  INVALID_FILE_TYPE: "Tipo de ficheiro não permitido",
  FILE_UPLOAD_FAILED: "Falha ao carregar ficheiro",
  FILE_NOT_FOUND: "Ficheiro não encontrado",
  FILE_PROCESSING_ERROR: "Erro ao processar ficheiro",
  
  // ============================================================================
  // ERROS HTTP GERAIS
  // ============================================================================
  INTERNAL_ERROR: "Erro interno. Por favor, tente novamente",
  BAD_REQUEST: "Pedido inválido",
  FORBIDDEN: "Acesso negado",
  NOT_FOUND: "Não encontrado",
  CONFLICT: "Conflito nos dados",
  TOO_MANY_REQUESTS: "Demasiados pedidos. Por favor, aguarde um momento",
  SERVICE_UNAVAILABLE: "Serviço temporariamente indisponível",
  
  // ============================================================================
  // ERROS DE BASE DE DADOS
  // ============================================================================
  DATABASE_ERROR: "Erro ao aceder aos dados",
  DATABASE_CONNECTION_ERROR: "Erro de ligação à base de dados",
  QUERY_ERROR: "Erro ao executar consulta",
  
  // ============================================================================
  // ERROS DE SERVIÇOS EXTERNOS
  // ============================================================================
  EMAIL_SEND_FAILED: "Falha ao enviar email",
  SMS_SEND_FAILED: "Falha ao enviar SMS",
  CAPTCHA_FAILED: "Falha na verificação CAPTCHA",
  PAYMENT_FAILED: "Falha no pagamento",
  
  // ============================================================================
  // ERROS ESPECÍFICOS DE PROCESSAMENTO SALARIAL
  // ============================================================================
  PAYROLL_ALREADY_PROCESSED: "O processamento salarial já foi efetuado",
  PAYROLL_LOCKED: "O processamento salarial está bloqueado e não pode ser modificado",
  PAYROLL_PERIOD_INVALID: "Período de processamento salarial inválido",
  SALARY_CALCULATION_ERROR: "Erro ao calcular salário",
  
  // ============================================================================
  // ERROS DE ASSIDUIDADE E FOLHAS DE HORAS
  // ============================================================================
  ATTENDANCE_ALREADY_RECORDED: "Assiduidade já registada para este período",
  TIMESHEET_ALREADY_APPROVED: "A folha de horas já foi aprovada",
  INVALID_CLOCK_IN_OUT: "Hora de entrada/saída inválida",
  OVERLAPPING_SHIFTS: "Turnos sobrepostos detetados",
  
  // ============================================================================
  // ERROS DE AUSÊNCIAS
  // ============================================================================
  LEAVE_BALANCE_INSUFFICIENT: "Saldo de ausências insuficiente",
  LEAVE_ALREADY_APPROVED: "O pedido de ausência já foi aprovado",
  OVERLAPPING_LEAVE: "Existe um pedido de ausência sobreposto",
  LEAVE_REQUEST_EXPIRED: "O pedido de ausência expirou",
  
  // ============================================================================
  // ERROS DE DEPARTAMENTO E FUNCIONÁRIO
  // ============================================================================
  DEPARTMENT_NOT_FOUND: "Departamento não encontrado",
  DEPARTMENT_HAS_EMPLOYEES: "O departamento tem funcionários e não pode ser eliminado",
  EMPLOYEE_NOT_FOUND: "Funcionário não encontrado",
  EMPLOYEE_ALREADY_EXISTS: "Funcionário já existe",
  
  // ============================================================================
  // ERROS DE DOCUMENTOS
  // ============================================================================
  DOCUMENT_NOT_FOUND: "Documento não encontrado",
  DOCUMENT_EXPIRED: "O documento expirou",
  DOCUMENT_ALREADY_VERIFIED: "O documento já foi verificado",
  
  // ============================================================================
  // ERROS DE REDE E TIMEOUT
  // ============================================================================
  NETWORK_ERROR: "Erro de rede. Por favor, verifique a sua ligação",
  REQUEST_TIMEOUT: "Tempo de espera do pedido esgotado. Por favor, tente novamente",
  
  // ============================================================================
  // PADRÃO E FALLBACK
  // ============================================================================
  UNKNOWN_ERROR: "Ocorreu um erro. Por favor, tente novamente",
  DEFAULT: "Ocorreu um erro. Por favor, tente novamente",
} as const;

export type ErrorCode = keyof typeof errorMessagesPT;
