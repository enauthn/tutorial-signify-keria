import signify from 'signify-ts';
import { waitOperation } from './utils';

(async () => {
    await signify.ready();
    const url = 'http://127.0.0.1:3901';
    const bootUrl = 'http://127.0.0.1:3903';
    
    const bran1 = signify.randomPasscode();
    const bran2 = signify.randomPasscode();
    
    const allieClient = new signify.SignifyClient(
        url,
        bran1,
        signify.Tier.low,
        bootUrl
    );
    await allieClient.boot();
    await allieClient.connect();
    
    const brettClient = new signify.SignifyClient(
        url,
        bran2,
        signify.Tier.low,
        bootUrl
    );
    await brettClient.boot();
    await brettClient.connect();
    
    const icpResult1 = await allieClient
        .identifiers()
        .create('aid1', {});
    await waitOperation(allieClient, await icpResult1.op());
    
    const rpyResult1 = await allieClient
        .identifiers()
        .addEndRole('aid1', 'agent', allieClient!.agent!.pre);
    await waitOperation(allieClient, await rpyResult1.op());
    
    // BrettClient resolves AllieClient's AID
    const oobi1 = await allieClient.oobis().get('aid1', 'agent');
    const oobiOp = await brettClient.oobis().resolve(oobi1.oobis[0], 'aid1');
    await waitOperation(brettClient, oobiOp);
    
    // AllieClient signs a message with aid1
    const aid1 = await allieClient.identifiers().get('aid1');
    const keeper1 = await allieClient.manager!.get(aid1);
    const message = "Test message";
    const signature = await keeper1.sign(signify.b(message))[0];
    console.log('signature', signature);
    
    // BrettClient verifies the signature
    const aid1StateBybrettClient = await brettClient.keyStates().get(aid1.prefix);
    const siger = new signify.Siger({qb64: signature});
    const verfer = new signify.Verfer({
        qb64: aid1StateBybrettClient[0].k[0]
    });
    console.log(verfer);
    const verificationResult = verfer.verify(siger.raw, signify.b(message));
    console.log('verificationResult', verificationResult);
  })();
  
