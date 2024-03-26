export const IbukiMessages: IbukiMessageType = {
    'Functionality:SourceComponent:DestinationComponent+fieldName': crypto.randomUUID(),
    'SHOW-MODAL-DIALOG-A': crypto.randomUUID(),
    'SHOW-MODAL-DIALOG-B': crypto.randomUUID(),
    'SHOW-MODAL-DIALOG-': crypto.randomUUID(),
}

type IbukiMessageType = {
    [key: string]: string
}