import { AppGridToolbar } from "../../../../components/controls/app-grid-toolbar";
import { ContentContainer } from "../../../../components/widgets/content-container";

export function SuperAdminClients(){
    return(
        <ContentContainer title='Super admin clients' >
            <AppGridToolbar title="Clients view" isLastNoOfRows={true} />
        </ContentContainer>
    )
}