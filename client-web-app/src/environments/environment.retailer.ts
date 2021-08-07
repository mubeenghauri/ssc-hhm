// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  orgName: 'Retailer',
  api: 'http://localhost:8001/retailer',
  
  // collection of actions for org
  actions: [
    // {
    //   'action': 'Add Batch',
    //   'url' : '/batch',
    //   'method' : 'POST',
    //   'icon': 'add'

    // },
    {
      'action': 'List Batches',
      'url' : '/batches',
      'method': 'GET',
      'icon': 'list'
    },
    {
        'action': 'Recieve Batch',
        'url' : '/recieve-batch',
        'method' : 'POST',
        'icon': 'input'
  
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

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
