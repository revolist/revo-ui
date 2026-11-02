export type TypeLink = { type: string; typeId?: string };
export type ApiMember = TypeLink & {
  name: string;
  required: boolean;
  description: string;
  inherited: boolean;
  via?: string;
};
export type ApiType = {
  id: string;
  name: string;
  definition: string;
  description: string;
  properties: ApiMember[];
  variants: TypeLink[];
  calls: { parameters: ApiMember[]; returns: TypeLink }[];
  indexes: (TypeLink & { key: string })[];
  element?: TypeLink;
  constraint?: TypeLink;
  external?: boolean;
};
export type ComponentApi = {
  name: string;
  families: string[];
  props: ApiMember[];
  events: ApiMember[];
  methods: ApiMember[];
  types: ApiType[];
};
