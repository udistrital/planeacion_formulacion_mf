export type Paso = {
    id:       string;
    nombre:   string;
    options?: Option[];
    ref:      null;
    required: string;
    sub?:     Paso[];
    type:     string;
}

export type Option = {
    valor: string;
}
