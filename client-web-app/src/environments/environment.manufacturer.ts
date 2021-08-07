export const environment = {
  production: false,
  orgName: 'Manufacturer',
  api: 'http://localhost:8001/manufacturer',
  
  // collection of actions for org
  actions: [
    {
      'action': 'Add Batch',
      'url' : '/batch',
      'method' : 'POST',
      'icon': 'add'

    },
    {
      'action': 'List Batches',
      'url' : '/batches',
      'method': 'GET',
      'icon': 'list'
    },
    {
      'action': 'Send Batch',
      'url' : '/send-batch',
      'method': 'POST',
      'icon': 'send'
    },
    {
      'action': 'Orders',
      'url' : '/orders',
      'method': 'GET',
      'icon': 'details'
    },
    
  ]
};
