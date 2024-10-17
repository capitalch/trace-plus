export const IbukiMessages = {
    'Functionality:SourceComponent:DestinationComponent+fieldName': crypto.randomUUID(),
    'DEBOUNCE-BU-CODE': 'DEBOUNCE-BU-CODE',
    'DEBOUNCE-CLIENT-CODE': 'DEBOUNCE-CLIENT-CODE',
    'DEBOUNCE-CLIENT-NAME': 'DEBOUNCE-CLIENT-NAME',
    'DEBOUNCE-ROLE-NAME': 'DEBOUNCE-ROLE-NAME',
    'DEBOUNCE-SECURED-CONTROL-NAME':'DEBOUNCE-SECURED-CONTROL-NAME',
    'DEBOUNCE-UID':'DEBOUNCE-UID',
    'SHOW-MODAL-DIALOG-A': 'SHOW-MODAL-DIALOG-A',
    'SHOW-MODAL-DIALOG-B': 'SHOW-MODAL-DIALOG-B',
    'SHOW-MODAL-DIALOG-': crypto.randomUUID(),
}

type IbukiMessageType = {
    [key: string]: string
}

interface IbukiMessageT  {
    [key: string]: string
}