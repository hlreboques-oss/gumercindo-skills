---
name: healthcare-appointment-intake-operations
description: Use when booking healthcare consults from intake to form.
version: 1.0.0
author: Hermes Agent
license: MIT
created_by: agent
tags: [healthcare, scheduling, intake, whatsapp, nutrio, patient-records]
metadata:
  hermes:
    tags: [healthcare, scheduling, intake, whatsapp, nutrio, patient-records]
    related_skills: [vps-kasmvnc-desktop-operations]
---

# Healthcare appointment intake operations

## When to Use

Use this when Carlos asks Gumercindo to simulate or operate a healthcare/nutrition appointment flow: a WhatsApp lead asks about a consultation, chooses to book, and the agent must collect patient data, register them in a clinical app, schedule, send a pre-consult form, attach exams, and prepare an anamnesis/pre-consult summary.

## Operating rules

- Treat patient data, plan documents, medical requests, exams, and anamnesis as sensitive health information. Do not expose it in summaries beyond what is needed for the active task.
- Do not ask for passwords, one-time codes, or private app credentials in chat. If the clinical app requires login, open it in a visual browser/VPS handoff and have Carlos log in directly.
- Do not give medical diagnosis or clinical guidance while doing intake. Collect facts, organize documents, and prepare a neutral pre-consult summary for the professional.
- Ask only for fields needed by the current screen or decision. Carlos prefers step-by-step execution over a long theoretical explanation.
- Before sending any WhatsApp confirmation or patient-facing message, present the exact text for approval unless Carlos has explicitly delegated that channel/action.

## Standard workflow

### 1. Establish the appointment route

Ask/record:

- Patient name
- Phone with DDD
- Email, if available
- Date of birth
- Gender, only if the app requires it
- CPF, only if available/required
- Attendance type: `particular` or `plano/convênio`
- Modality: `presencial` or `online`
- Desired day/time window

For this user's nutrition consultation flow, use these default windows unless the app agenda proves otherwise:

- Presential: **08:00–11:00**
- Online: **13:00–18:00**

### 2. If the patient is plano/convênio

Collect and attach, when available:

- Plan/insurance name
- Carteirinha do plano
- Pedido médico
- Any authorization or guide number if the app asks for it

Do not proceed as if the plan is accepted just because the patient says they have a plan. Mark missing documents explicitly and ask Carlos/patient for them.

### 3. Create or update the patient record

In Nutrio, the **Criar paciente** modal starts with these visible fields:

- Nome (required)
- Email (optional)
- Gênero (required: Masculino/Feminino)
- Data de nascimento (required)
- Celular com DDD (required)
- CPF/CNPJ (optional)
- Tags

Enter only provided values. If a required field is missing, stop and ask for that single value rather than inventing placeholders. Treat CPF/CNPJ as optional in Nutrio: if a fictitious or malformed CPF is rejected, clear the field and continue rather than blocking the simulation.

### 4. Schedule the consultation

Navigate to the agenda/appointment area after the patient exists. In Nutrio, the patient profile has an **Agendamentos** card with a `+`; the modal defaults can include `Consulta`, `Pendente`, and modality options.

Choose the modality and time based on the route:

- Presential: look for slots between 08:00 and 11:00.
- Online: look for slots between 13:00 and 18:00.

For plano/convênio patients with missing carteirinha or pedido médico, keep the appointment administratively **Pendente** until the missing document state is resolved; do not mark it confirmed just to finish the flow. If presential scheduling requires **Local de atendimento** and none exists, stop and ask Carlos what location name/address to create instead of inventing a clinic address.

If no slot exists in the preferred window, report available alternatives and ask Carlos before choosing.

### 5. Generate and send the pre-consult form

Inside the app, generate the pre-consult/formulário for the patient when available. Capture or copy the form link/send action, then prepare a patient-facing message such as:

```text
Seu agendamento ficou reservado. Para deixar sua consulta mais completa, preencha este formulário de pré-consulta antes do atendimento e anexe os exames que tiver disponíveis: {link}
```

Send only after approval or when the destination/action has been explicitly delegated.

### 6. Attach conversation files and exams

Attach files from the WhatsApp conversation to the patient record when the app supports it. Name/label uploads clearly by document type:

- `carteirinha_plano`
- `pedido_medico`
- `exame_<tipo>`
- `documento_paciente`

Verify the upload appears in the patient record before claiming it was attached.

### 7. Prepare the anamnesis/pre-consult summary

In Nutrio, if the patient filled the public pre-consult form, do **not** create the first anamnesis manually. First go to the patient record → **Questionário** → **Respostas públicas** → open the filled **Pré-consulta nutricional** response with **Ver** → click **Enviar para anamnese**. This opens an anamnesis pre-filled from the questionnaire (`from_questionnaire=1`); save that anamnesis, then proceed with attaching exams/photos/documents and any administrative notes. Only create a manual/free-text anamnesis when no filled questionnaire response exists or when adding a clearly labeled supplemental administrative note.

After the form is filled or enough intake details exist, prepare a neutral anamnesis summary for the professional. Include:

- Identification: name, age/date of birth, phone
- Consultation type: plan/private and online/presential
- Main reason for consultation in the patient's words
- Relevant history and symptoms/goals, only if provided
- Current medications/supplements/allergies, only if provided
- Exams/documents attached
- Missing information/questions for the consultation
- Administrative notes: plan documents, appointment time, confirmation status

Do not transform incomplete intake into clinical conclusions. Use “não informado” for missing fields.

### 8. Confirm to the patient

Final confirmation should include:

- Date and time
- Online or presential modality
- If online: meeting/link instructions if available
- If presential: address/arrival guidance if available
- Reminder to complete form and attach exams
- For plan patients: reminder about carteirinha/pedido médico if not already attached

## App/navigation notes

- Prefer operating in the VPS visual browser when Carlos needs to log into a healthcare SaaS. Use the KasmVNC handoff route and have Carlos type credentials directly.
- Always capture a real screenshot after login/navigation before claiming which screen is open.
- If the app is dense or click coordinates are unreliable, switch from repeated pixel clicks to a browser DOM/CDP route in the same logged-in profile when possible.
- In Nutrio, the patient access link is available from **Link de acesso paciente** on the patient profile. The public pre-consult form link is available in **Questionários → Copiar link** after creating the questionnaire; install/use a clipboard reader such as `xclip` in the VPS if the visual toast says “Copiado!” but the URL is not otherwise visible.
- When scheduling in Nutrio, set **Fuso horário do paciente** to `Brasília / São Paulo (GMT-3)` for Brazil/Rio de Janeiro patients before interpreting the patient-facing time. The raw UTC fields can show a different hour; use the app's “Para o paciente” line as the time to communicate.
- For a quick first pre-consult questionnaire in Nutrio, a single open-text question can capture the minimum anamnesis inputs: reason for consultation, main goal, food routine, health history, medications, allergies, recent exams, and other relevant notes. Do not claim clinical anamnesis is complete until the patient actually responds and files are attached.

## Pitfalls

- Do not invent patient demographics to get past required fields; required medical-record fields must come from Carlos/patient or be left pending.
- Do not mark a convênio consultation as confirmed until required plan documents are collected or the missing-document state is explicit.
- Do not send the pre-consult link before ensuring it belongs to the correct patient record.
- Do not summarize exams clinically unless a clinician supplied that interpretation; attach them and list them as received.
