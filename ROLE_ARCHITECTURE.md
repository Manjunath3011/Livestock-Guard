# LivestockGuard: Protected Role-Based Architecture

> **ARCHITECTURE STATUS: LOCKED & PROTECTED**  
> Under no circumstances should the role-specific dashboards be merged into a single generic dashboard or replaced with fallback mocks.

---

## 1. Core System Roles

LivestockGuard operates with **7 strictly segregated, role-specific stakeholder dashboards**:

| Role Constant | Canonical Name | Target Stakeholder | Primary Dashboard Component | Primary Responsibilities |
| :--- | :--- | :--- | :--- | :--- |
| `FARMER` | `farmer` | Livestock Owner / Smallholder | `FarmerDashboardView` | Herd health reporting, symptom entry, vaccination schedule, local bio-alerts |
| `FIELD_WORKER` | `field_worker` | Para-Veterinarian / Field Worker | `FieldWorkerDashboardView` | Doorstep surveillance, RFID tagging, field visits, offline synchronization |
| `VETERINARIAN` | `veterinarian` | Clinical Veterinary Doctor | `VeterinaryDashboardView` | Clinical triage, diagnoses, prescriptions, lab referrals, quarantine advisories |
| `DIAGNOSTIC_LAB` / `LABORATORY_STAFF` | `diagnostic_lab` | Laboratory Pathologist / Staff | `LaboratoryDashboardView` | Sample intake, RT-PCR / ELISA testing, result verification, pathology reports |
| `DISTRICT_OFFICIAL` | `district_official` | District Animal Husbandry Joint Director | `DistrictOfficialDashboardView` | Outbreak command, block containment, rapid response team dispatch, district analytics |
| `STATE_ADMIN` | `state_admin` | State Directorate & Commissioners | `StateAdminDashboardView` | Statewide surveillance radar, ring vaccination strategy, macro logistics, state advisories |
| `SYSTEM_ADMIN` | `system_admin` | IT & Systems Architect | `SystemAdminDashboardView` | RBAC governance, AI surveillance engine weights, audit trails, database maintenance |

---

## 2. Architectural Hierarchy

The rendering lifecycle is routed through the centralized `RoleRouter`:

```
App
 └── Authentication & Persistent Store
      └── Header (with 1-Click Role Switcher)
      └── Sidebar (with Role-Filtered Navigation Matrix)
      └── Main Content Area
           └── RoleRouter (Single Source of Truth for Role Dashboards)
                ├── [FARMER]           → <FarmerDashboardView />
                ├── [FIELD_WORKER]     → <FieldWorkerDashboardView />
                ├── [VETERINARIAN]     → <VeterinaryDashboardView />
                ├── [DIAGNOSTIC_LAB]   → <LaboratoryDashboardView />
                ├── [DISTRICT_OFFICIAL]→ <DistrictOfficialDashboardView />
                ├── [STATE_ADMIN]      → <StateAdminDashboardView />
                └── [SYSTEM_ADMIN]     → <SystemAdminDashboardView />
```

---

## 3. Central Role Definitions

All roles and mappings are centralized in `/src/auth/roles.ts`:

- `USER_ROLES`: Centralized dictionary of role identifiers.
- `normalizeRole(input)`: Safe string normalizer handling variations like `field`, `para_vet`, `diagnostic_lab`, `sysadmin`.
- `getRoleMetadata(role)`: Provides consistent UI labels, emojis, badge classes, and associated component names.

---

## 4. Protected Invariants

1. **Deterministic Dispatch**: The `RoleRouter` is the single source of truth deciding which dashboard renders when `activeModule === 'dashboard'`.
2. **Session Persistence**: Role selections are stored in `localStorage` under `lg_current_user` and `lg_current_role` to persist across reloads, network reconnects, and navigation.
3. **No Silent Fallback**: If an invalid or unauthenticated role is encountered, the system presents an explicit error boundary with `[ Retry Session ]` and `[ Select Default Demo Role ]` rather than rendering an arbitrary generic view.
4. **Role Scoping**: Data queries (`getScopedCases`, `getScopedAnimals`, `getScopedAlerts`) automatically filter datasets based on the active role's jurisdiction.
