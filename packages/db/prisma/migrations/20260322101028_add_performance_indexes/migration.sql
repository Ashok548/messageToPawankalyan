-- CreateIndex
CREATE INDEX "atrocities_atrocity_type_idx" ON "atrocities"("atrocity_type");

-- CreateIndex
CREATE INDEX "atrocities_is_verified_created_at_idx" ON "atrocities"("is_verified", "created_at");

-- CreateIndex
CREATE INDEX "atrocities_state_is_verified_idx" ON "atrocities"("state", "is_verified");

-- CreateIndex
CREATE INDEX "disciplinary_cases_initiated_by_idx" ON "disciplinary_cases"("initiated_by");

-- CreateIndex
CREATE INDEX "disciplinary_cases_review_authority_idx" ON "disciplinary_cases"("review_authority");

-- CreateIndex
CREATE INDEX "disciplinary_cases_decision_authority_idx" ON "disciplinary_cases"("decision_authority");

-- CreateIndex
CREATE INDEX "disciplinary_cases_status_visibility_idx" ON "disciplinary_cases"("status", "visibility");

-- CreateIndex
CREATE INDEX "leaders_status_district_idx" ON "leaders"("status", "district");

-- CreateIndex
CREATE INDEX "leaders_status_created_at_idx" ON "leaders"("status", "created_at");

-- CreateIndex
CREATE INDEX "social_media_warriors_status_district_idx" ON "social_media_warriors"("status", "district");

-- CreateIndex
CREATE INDEX "social_media_warriors_status_created_at_idx" ON "social_media_warriors"("status", "created_at");
