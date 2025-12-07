# Auto-Approval Documentation for Technician Registration

## Overview

The technician registration system includes an **automatic approval feature** that approves technician accounts immediately when documents are uploaded during registration. This feature works for **all document types** (CIN, Diplomas, Certificates, and Other documents).

## How It Works

### Auto-Approval Logic

When a technician registers and uploads documents:

1. **Document Upload**: The system accepts multiple document types:
   - **CIN** (Carte Nationale d'Identité) - Required
   - **DIPLOMA** (Diplômes) - Optional
   - **CERTIFICATE** (Certificats) - Optional
   - **OTHER** (Autres documents) - Optional

2. **Automatic Approval**: 
   - When **any document is uploaded** (CIN, Diplomas, Certificates, or Other), the technician's `verificationStatus` is automatically set to `APPROVED`
   - This means the technician account is immediately verified and can start accepting bookings
   - A notification is sent to the technician confirming the auto-approval with details of uploaded documents
   - **Important**: CIN is still required for validation, but auto-approval works for ALL document types

3. **Verification Status**:
   - If documents are uploaded: `verificationStatus = 'APPROVED'`
   - If no documents are uploaded: `verificationStatus = 'PENDING'` (requires manual admin approval)

## Implementation Details

### Backend (`backend/src/routes/auth.routes.ts`)

```typescript
// Auto-approve verification when ANY document is uploaded (CIN, Diploma, Certificate, or Other)
const hasCIN = !!nationalIdCardFile || documents.some(doc => doc.type === 'CIN');
const hasAnyDocument = hasCIN || documents.length > 0;

const technicianProfile = await prisma.technicianProfile.create({
  data: {
    userId: user.id,
    skills: [],
    yearsOfExperience: 0,
    // Auto-approve if any document is uploaded
    verificationStatus: hasAnyDocument ? 'APPROVED' : 'PENDING',
  },
});

// Create notification for auto-approval when any document is uploaded
if (hasAnyDocument) {
  const documentTypes = documents.map(doc => {
    switch (doc.type) {
      case 'CIN': return 'CIN';
      case 'DIPLOMA': return 'diplôme';
      case 'CERTIFICATE': return 'certificat';
      case 'OTHER': return 'document';
      default: return 'document';
    }
  }).join(', ');
  
  await prisma.notification.create({
    data: {
      userId: user.id,
      type: 'VERIFICATION_APPROVED',
      message: `Votre compte technicien a été approuvé automatiquement après l'upload de votre${documents.length > 1 ? 's' : ''} ${documentTypes}.`,
    },
  });
}
```

### Frontend (`frontend/src/pages/technician/TechnicianRegisterPage.tsx`)

The frontend sends documents in the following format:

```typescript
// Append all documents
documents.forEach((doc, index) => {
  formDataToSend.append(`documents[${index}][file]`, doc.file);
  formDataToSend.append(`documents[${index}][type]`, doc.type);
});
```

### Document Type Mapping

The system maps frontend document types to Prisma enum values:

| Frontend Type | Prisma Enum | Description |
|--------------|-------------|-------------|
| `CIN` | `ID_CARD` | Carte Nationale d'Identité (Required) |
| `DIPLOMA` | `DIPLOMA` | Diplômes (Optional) |
| `CERTIFICATE` | `CERTIFICATE` | Certificats (Optional) |
| `OTHER` | `OTHER` | Autres documents (Optional) |

## Database Schema

### Prisma Schema Update

The `DocumentType` enum has been updated to include `DIPLOMA`:

```prisma
enum DocumentType {
  ID_CARD
  DIPLOMA      // Added for diploma support
  CERTIFICATE
  OTHER
}
```

### TechnicianDocument Model

```prisma
model TechnicianDocument {
  id                  String            @id @default(uuid())
  technicianProfileId String
  technicianProfile   TechnicianProfile @relation(...)
  type                DocumentType
  fileUrl             String
  uploadedAt          DateTime          @default(now())
}
```

## User Experience

### Registration Flow

1. **User fills registration form** with personal information
2. **User uploads documents**:
   - CIN (mandatory) - triggers auto-approval
   - Diplomas (optional) - also triggers auto-approval
   - Certificates (optional) - also triggers auto-approval
   - Other documents (optional) - also triggers auto-approval
3. **System automatically approves** the account if any document is uploaded
4. **User receives notification** confirming approval
5. **User can immediately** access the technician dashboard and accept bookings

### Visual Feedback

- **CIN Button**: Changes to green when CIN is uploaded
- **Document List**: Shows uploaded files with type tags
- **Status**: Technician account is immediately active after registration

## Benefits

1. **Faster Onboarding**: Technicians can start working immediately after registration
2. **Better User Experience**: No waiting period for manual approval
3. **Trust Building**: Document upload demonstrates commitment and legitimacy
4. **Scalability**: Reduces admin workload for manual approvals

## Configuration

### Enable/Disable Auto-Approval

To modify the auto-approval behavior, edit `backend/src/routes/auth.routes.ts`:

```typescript
// Current: Auto-approve when any document is uploaded
verificationStatus: hasCIN ? 'APPROVED' : 'PENDING',

// To require manual approval always:
verificationStatus: 'PENDING',

// To require specific document types:
const hasRequiredDocs = documents.some(doc => 
  doc.type === 'CIN' && documents.some(d => d.type === 'DIPLOMA')
);
verificationStatus: hasRequiredDocs ? 'APPROVED' : 'PENDING',
```

## Migration Notes

### Database Migration Required

After updating the Prisma schema, you need to apply the migration:

**For Development:**
```bash
cd backend
npx prisma migrate dev --name add_diploma_document_type
npx prisma generate
```

**For Production (if migrate dev fails due to shadow database permissions):**
```bash
cd backend
# Option 1: Use db push (for development/testing)
npx prisma db push

# Option 2: Use migrate deploy (for production)
npx prisma migrate deploy

# Always regenerate Prisma client after schema changes
npx prisma generate
```

**Manual Migration (if needed):**
If automatic migration fails, you can manually update the enum in MySQL:
```sql
ALTER TABLE TechnicianDocument 
MODIFY COLUMN type ENUM('ID_CARD', 'DIPLOMA', 'CERTIFICATE', 'OTHER') NOT NULL;
```

**Note**: The Prisma schema has already been updated with `DIPLOMA` in the `DocumentType` enum. The migration file is located at:
`backend/prisma/migrations/add_diploma_document_type_manual/migration.sql`

### Backward Compatibility

The system maintains backward compatibility with the old format:
- Old format: `nationalIdCard` (single file)
- New format: `documents[0][file]`, `documents[1][file]`, etc. (multiple files)

Both formats are supported and trigger auto-approval.

## Testing

### Test Cases

1. **CIN Only**: Upload CIN → Account approved ✅
2. **CIN + Diploma**: Upload CIN and Diploma → Account approved ✅
3. **Diploma Only**: Upload Diploma (no CIN) → Account approved ✅
4. **Certificate Only**: Upload Certificate (no CIN) → Account approved ✅
5. **Other Only**: Upload Other document (no CIN) → Account approved ✅
6. **No Documents**: No documents uploaded → Account pending ⏳

## Notes

- **CIN is still required** for validation, but auto-approval works for all document types
- **Notification is sent** only when CIN is present (can be extended to all types)
- **All uploaded documents** are stored in the database regardless of approval status
- **Admin can still manually** reject or approve accounts if needed

