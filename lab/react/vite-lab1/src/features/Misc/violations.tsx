export function Violations() {

    return (<button className="bg-slate-200 te" onClick={handleClick}>Violations</button>)

    function handleClick() {
        const violations: any[] = vlns
        const violationsList: string[] = violations.reduce((acc, violation,index) => {
            if (violation?.mlsRule?.ruleNumber) {
                if (violation?.mlsRule?.ruleTitle) {
                    const ruleNumber: string = violation.mlsRule.ruleNumber
                    const ruleTitle: string = violation.mlsRule.ruleTitle
                    acc.push(`<div key='${index}'>${ruleNumber} ${ruleTitle}</div>`)
                }
            }
            return acc
        }, [] as any[])
        console.log(
            
            violationsList
        )
    }
}

const vlns: any[] = [
    {
        "complianceCaseId": "e37986a3-7ce7-4537-a5bb-08dbb3023282",
        "mlsRuleId": "f3b9bb03-6872-411d-4143-08db6774e811",
        "mlsRule": {
            "ruleNumber": "12.8.1(c)",
            "ruleTitle": "Displaying Unauthorized Photograph on Neighborhood Market Report",
            "warning": false,
            "citationFee": 1500.00,
            "mlsRulebookText": "<p>Advertising of Listing in Printed Neighborhood Market Report. Subject to the conditions set forth in (a)through(c) below, as well as throughout these Rules, Participants and Subscribers may include the listings of others in their printed &ldquo;Neighborhood Market Reports.&rdquo; The &ldquo;Neighborhood Market Report&rdquo; is defined as an advertising and / or information sheet(typically appearing in the form of a postcard, flier or newsletter) compiled by and / or for use by a licensee which sets forth a list of home activity in a particular neighborhood area.Advertising appearing in newspapers, magazines or other classified forms is not included in the definition of &ldquo;Neighborhood Market Report&rdquo; and is not authorized by this Rule 12.8.1.</p>\n<p><strong>c)</strong> <strong>Allowable Listing Content. </strong>Broker Participants and Subscribers may include only those portions of the MLS compilation consisting of the following: property address(and whether attached or detached), status, price, number of bedrooms, number of bathrooms, number of garages(and whether attached or detached), square footage, lot size, year built, tract or development name, and if there&rsquo;s a pool.Display of other fields, as well as confidential information and photographs, is prohibited.</p>",
            "processingGuideline": "<p>Policy: To investigate reports of this violation and enforce this rule to prevent the use of prohibited and confidential information on the MLS.</p>\n<p>Application: 9. The most common reports received under this subsection include Neighborhood Market Reports (NMR) which advertise confidential information, such as compensation amounts, Days on Market (DOM), and list prices. The inclusion of photographs is not permitted. a. A violation for the inclusion of prohibited or confidential information results in a fine in the amount of $250. b. A violation for the inclusion of an unauthorized photograph results in a fine in the amount of $1,500. 10. Flyers are not the same as NMRs. NMRs have a grid-like layout, similar to Matrix&rsquo;s Agent 1- line display, and usually include minimal information such as the bedroom count, bathroom count, square footage, address, and status. The information on an NMR is also concentrated to include a specific area. 11. A copy of each side of the Neighborhood Market Report must be saved as evidence and attached to the case prior to issuing a citation. 65 Procedures: 9. Review the information displayed on the NMR and confirm that all data is accessible by public records. 10. If the NMR reported does not include prohibited or confidential information, close the case as No Violation. 11. If the NMR includes information that is prohibited or deemed confidential, issue a Citation: a. Citation Notice: This notice will reference the rule and include all information gathered as evidence to conclude our investigation. The NMR received will be referenced as well as which specific fields or information were inappropriately advertised. All brokers and office managers will be copied on this notice and the Association contact will be included as a BCC. 12. If the flyer is found to be in violation of other Rules, such as 12.8.1(a) for the use of unauthorized listings or 12.8.1(b) for not including proper attribution, issue a new Citation Notice under such rule. Reference the appropriate section for instructions on how to proceed with your investigation.</p>",
            "emailTemplate": "<p>N/A</p>",
            "fineType": "fixed",
            "resources": null,
            "isDeleted": null,
            "inquiryTemplate": null,
            "warningTemplate": null,
            "citationTemplate": null,
            "createdBy": null,
            "createdOn": "2023-06-07T12:33:21.352065-04:00",
            "id": "f3b9bb03-6872-411d-4143-08db6774e811",
            "modifiedBy": "de01f150-35b2-4197-9862-831cc3819c29",
            "modifiedOn": "2023-06-14T15:15:33.9378499+00:00"
        },
        "enumerationLookupId": null,
        "enumerationLookup": null,
        "corrected": true,
        "reportId": null,
        "report": null,
        "isDeleted": null,
        "createdBy": "5c1f9d04-2404-44ac-9e9d-148eff99b89c",
        "createdOn": "2024-01-09T19:10:17.4597721+00:00",
        "id": "bee015b5-d3cc-4694-6f9a-08dc088a77ec",
        "modifiedBy": "5c1f9d04-2404-44ac-9e9d-148eff99b89c",
        "modifiedOn": "2024-01-10T15:43:03.9747915+00:00"
    },
    {
        "complianceCaseId": "e37986a3-7ce7-4537-a5bb-08dbb3023282",
        "mlsRuleId": "9885b1a7-5f83-42ad-dc67-08db6c4d632b",
        "mlsRule": {
            "ruleNumber": "11.5(a)",
            "ruleTitle": "Improper Media Content",
            "warning": true,
            "citationFee": 100.00,
            "mlsRulebookText": "<div data-loaded=\"true\" data-page-number=\"30\">\n<div><strong>Media on the MLS. </strong>Media is defined as any depiction or expression of works including, but not limited to, photographs, images, drawings, renderings, audio, video, and virtual tours. The Participant/Subscriber submitting Media to the MLS grants CRMLS an irrevocable, unrestricted, transferable, perpetual, royalty-free, non-exclusive license (with right to sublicense) to use, store, reproduce, compile, display and distribute the media as part of its compilation. Submitted Media is any content placed in a listing, or content that is accessible by external links placed in a listing. Media submitted to the MLS is subject to the following:&nbsp;<strong><br /><br />a) Content Restrictions. </strong>Content of Media submitted to the MLS shall be limited to visual representations of the property, anything included in the sale of the property, and/or any amenities or features related to the property. Inclusion of text or written communication, content that may be determined to create a safety hazard or concern, or content that is otherwise deemed to be inappropriate by MLS staff is prohibited. MLS staff shall have the right to remove from the MLS any Media that is in violation of any MLS rule, including but not limited to this section.</div>\n</div>",
            "processingGuideline": "<p>N/A</p>",
            "emailTemplate": "<p>N/A</p>",
            "fineType": "fixed",
            "resources": null,
            "isDeleted": null,
            "inquiryTemplate": null,
            "warningTemplate": null,
            "citationTemplate": null,
            "createdBy": "de01f150-35b2-4197-9862-831cc3819c29",
            "createdOn": "2023-06-14T18:23:45.9621591+00:00",
            "id": "9885b1a7-5f83-42ad-dc67-08db6c4d632b",
            "modifiedBy": "de01f150-35b2-4197-9862-831cc3819c29",
            "modifiedOn": "2023-06-14T18:31:33.2221991+00:00"
        },
        "enumerationLookupId": null,
        "enumerationLookup": null,
        "corrected": null,
        "reportId": null,
        "report": null,
        "isDeleted": null,
        "createdBy": "5c1f9d04-2404-44ac-9e9d-148eff99b89c",
        "createdOn": "2024-01-09T19:10:17.470836+00:00",
        "id": "cca14aaf-7a4b-4209-6f9b-08dc088a77ec",
        "modifiedBy": "5c1f9d04-2404-44ac-9e9d-148eff99b89c",
        "modifiedOn": "2024-01-09T19:10:17.470836+00:00"
    }
]