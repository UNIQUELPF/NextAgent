{{- define "portal.fullname" -}}
{{- printf "%s-%s" .Release.Name .Chart.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "portal.labels" -}}
app.kubernetes.io/name: {{ .Chart.Name }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{- define "portal.selectorLabels" -}}
app.kubernetes.io/name: {{ .Chart.Name }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{- define "portal.serviceAccountName" -}}
{{- default (include "portal.fullname" .) .Values.serviceAccountName -}}
{{- end -}}

{{- define "portal.indentConfig" -}}
{{- $n := .n -}}
{{- $value := .value -}}
{{- if $value }}
{{- $value | trim | indent $n -}}
{{- else -}}
""
{{- end -}}
{{- end -}}

{{- define "portal.serviceName" -}}
{{- printf "%s-%s" (include "portal.fullname" .) .service | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "portal.backendInternalURL" -}}
http://{{ include "portal.fullname" . }}-backend:8080
{{- end -}}

{{- define "portal.oathkeeperInternalURL" -}}
http://{{ include "portal.fullname" . }}-oathkeeper:4456
{{- end -}}

{{- define "portal.kratosAdminURL" -}}
http://{{ include "portal.fullname" . }}-kratos-admin:{{ .Values.kratos.admin.servicePort }}
{{- end -}}

{{- define "portal.kratosPublicURL" -}}
http://{{ include "portal.fullname" . }}-kratos-public:{{ .Values.kratos.public.servicePort }}
{{- end -}}

{{- define "portal.ketoReadURL" -}}
http://{{ include "portal.fullname" . }}-keto:4466
{{- end -}}

{{- define "portal.ketoWriteURL" -}}
http://{{ include "portal.fullname" . }}-keto:4467
{{- end -}}

{{- define "portal.publicURL" -}}
{{- $scheme := default "http" .Values.global.publicProtocol -}}
{{- $host := default "portal.local" .Values.global.publicHost -}}
{{- printf "%s://%s" $scheme $host -}}
{{- end -}}

{{- define "portal.frontendInternalURL" -}}
http://{{ include "portal.fullname" . }}-frontend:3000
{{- end -}}
