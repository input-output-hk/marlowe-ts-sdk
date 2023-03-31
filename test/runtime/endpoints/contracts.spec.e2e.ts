
import { pipe } from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option';
import * as TE from 'fp-ts/TaskEither'
import { close } from '../../../src/language/core/v1/semantics/contract/close'
import { AxiosRestClient } from '../../../src/runtime/endpoints';
import { initialise } from '../../../src/runtime/write/command';
import { initialiseBankAndverifyProvisionning } from '../provisionning'
import { getBankPrivateKey, getBlockfrostContext, getMarloweRuntimeUrl } from '../context';


describe('contracts endpoints', () => {

  const restApi = AxiosRestClient(getMarloweRuntimeUrl())

  it(' can build a Tx for Initialising a Marlowe Contract' + 
     '(can POST: /contracts/ )', async () => {                           
    await 
      pipe( initialiseBankAndverifyProvisionning
              (getMarloweRuntimeUrl())
              (getBlockfrostContext ())
              (getBankPrivateKey())              
          , TE.bind('postContractResponse',({bank}) => 
                restApi.contracts.post(  { contract: close
                                        , version: 'v1'
                                        , metadata: {}
                                        , tags : {}
                                        , minUTxODeposit: 2_000_000}
                                      , { changeAddress: bank.address
                                        , usedAddresses: O.none
                                        , collateralUTxOs: O.none}))
          , TE.map (({postContractResponse}) => postContractResponse)
          , TE.match(
              (e) => { console.dir(e, { depth: null }); expect(e).not.toBeDefined()},
              () => {})) ()
                              
  },100_000),
  it('can Initialise a Marlowe Contract ' + 
     '(can POST: /contracts/ => build the Tx server side' +
     ' and PUT : /contracts/{contractid} => Append the Contract Tx to the Cardano ledger' + 
     ' and GET /contracts/{contractid} => provide details about the contract initialised)', async () => {            
      await
        pipe( initialiseBankAndverifyProvisionning
                (getMarloweRuntimeUrl())
                (getBlockfrostContext ())
                (getBankPrivateKey())              
            , TE.bindW('contractDetails',({bank}) => 
                  initialise
                    (restApi)
                    (bank.waitConfirmation)
                    (bank.signMarloweTx)
                    ({ changeAddress: bank.address
                      , usedAddresses: O.none
                      , collateralUTxOs: O.none})
                    ( { contract: close
                        , version: 'v1'
                        , metadata: {}
                        , tags : {}
                        , minUTxODeposit: 2_000_000}))
            , TE.match(
                  (e) => { console.dir(e, { depth: null }); 
                          expect(e).not.toBeDefined()},
                  () => {})) ()
                                
  },100_000),
  it('can navigate throught Initialised Marlowe Contracts pages' + 
     '(GET:  /contracts/)', async () => {            
    await 
      pipe( initialiseBankAndverifyProvisionning
              (getMarloweRuntimeUrl())
              (getBlockfrostContext ())
              (getBankPrivateKey())                  
          , TE.bindW('firstPage' ,() => restApi.contracts.getHeadersByRange(O.none)) 
          , TE.match(
                (e) => { console.dir(e, { depth: null }); expect(e).not.toBeDefined()},
                () => {})) ()
    
                              
  },100_000)
})

