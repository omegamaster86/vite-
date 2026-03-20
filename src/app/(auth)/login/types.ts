export type LoginFormErrors = {
	email?: string;
	password?: string;
	general?: string;
};

export type LoginFormData = {
	email: string;
	password: string;
};

export type LoginActionState = {
	errors: LoginFormErrors;
};
