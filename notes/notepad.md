## autoRefNo

async def handle_auto_ref_no(sqlObject, acur):
    xData = sqlObject.get("xData", {})
    if (
        "id" in xData and not xData["id"] and
        "finYearId" in xData and
        "branchId" in xData and
        "tranTypeId" in xData
    ):
        finYearId = xData["finYearId"]
        branchId = xData["branchId"]
        tranTypeId = xData["tranTypeId"]

        # Fetch lastNo from TranCounter and increment it
        await acur.execute(
            """
            SELECT lastNo FROM "TranCounter"
            WHERE "finYearId" = %s AND "branchId" = %s AND "tranTypeId" = %s
            FOR UPDATE
            """,
            (finYearId, branchId, tranTypeId)
        )
        tran_counter = await acur.fetchone()
        if not tran_counter:
            raise RuntimeError("TranCounter entry not found for the given keys.")
        lastNo = tran_counter["lastNo"] + 1

        # Update lastNo in TranCounter
        await acur.execute(
            """
            UPDATE "TranCounter"
            SET "lastNo" = %s
            WHERE "finYearId" = %s AND "branchId" = %s AND "tranTypeId" = %s
            """,
            (lastNo, finYearId, branchId, tranTypeId)
        )

        # Fetch tranTypeCode from TranTypeM
        await acur.execute(
            """
            SELECT "tranCode" FROM "TranTypeM"
            WHERE "id" = %s
            """,
            (tranTypeId,)
        )
        tran_type = await acur.fetchone()
        if not tran_type:
            raise RuntimeError("TranTypeM entry not found for the given tranTypeId.")
        tranTypeCode = tran_type["tranCode"]

        # Fetch branchCode from BranchM
        await acur.execute(
            """
            SELECT "branchCode" FROM "BranchM"
            WHERE "id" = %s
            """,
            (branchId,)
        )
        branch = await acur.fetchone()
        if not branch:
            raise RuntimeError("BranchM entry not found for the given branchId.")
        branchCode = branch["branchCode"]

        # Generate autoRefNo
        autoRefNo = f"{tranTypeCode}/{branchCode}/{lastNo}/{finYearId}"

        # Replace autoRefNo in xData
        xData["autoRefNo"] = autoRefNo
