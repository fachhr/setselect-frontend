export interface Candidate {
    id: string;
    role: string;
    skills: string[];
    experience: string;
    seniority: string;
    cantons: string[];
    salaryMin: number;
    salaryMax: number;
    availability: string;
    entryDate: string;
}

export interface Canton {
    code: string;
    name: string;
}

export interface SelectOption {
    label: string;
    value: string;
}