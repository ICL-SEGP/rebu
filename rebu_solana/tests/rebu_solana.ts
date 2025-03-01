import * as anchor from "@project-serum/anchor";
import * as splToken from "@solana/spl-token";
import { Program } from "@project-serum/anchor";
import { RebuSolana } from "../target/types/rebu_solana";
import { LAMPORTS_PER_SOL, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { assert, expect } from "chai";

describe("rebu_solana", () => {
  const provider =  anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.RebuSolana as Program<RebuSolana>;
  
  const seller =  provider.wallet.publicKey; // anchor.web3.Keypair.generate();
  const payer = (provider.wallet as NodeWallet).payer;

  const buyer =  anchor.web3.Keypair.generate();
  console.log(`Buyer :: `, buyer.publicKey.toString());
  
  const escrowedXTokens = anchor.web3.Keypair.generate();
  console.log(`escrowedXTokens :: `, escrowedXTokens.publicKey.toString());


  let x_mint;
  let y_mint;
  let sellers_x_token;
  let sellers_y_token;
  let buyer_x_token;
  let buyer_y_token;
  let escrow: anchor.web3.PublicKey;


  before(async() => {

    // Derive escrow address
    [escrow] = anchor.web3.PublicKey.findProgramAddressSync([
      anchor.utils.bytes.utf8.encode("escrow6"),
      seller.toBuffer()
    ], 
    program.programId)

    x_mint = await splToken.Token.createMint(
      provider.connection,
      payer,
      provider.wallet.publicKey,
      provider.wallet.publicKey,
      6,
      splToken.TOKEN_PROGRAM_ID
    );

    console.log(`x_mint :: `, x_mint.publicKey.toString());
    
    

    y_mint = await splToken.Token.createMint(
      provider.connection,
      payer,
      provider.wallet.publicKey,
      null,
      6,
      splToken.TOKEN_PROGRAM_ID
    );

    console.log(`y_mint :: `, y_mint.publicKey.toString());

    // seller's x and y token account
    sellers_x_token = await x_mint.createAccount(seller);
    console.log(`sellers_x_token :: `, sellers_x_token.toString());

    await x_mint.mintTo(sellers_x_token, payer, [], 10_000_000_000);

    sellers_y_token = await y_mint.createAccount(seller);
    console.log(`sellers_y_token :: `, sellers_y_token.toString());

    // buyer's x and y token account
    buyer_x_token = await x_mint.createAccount(buyer.publicKey);
    console.log(`buyer_x_token :: `, buyer_x_token.toString());

    buyer_y_token = await y_mint.createAccount(buyer.publicKey);
    console.log(`buyer_y_token :: `, buyer_y_token.toString());

    await y_mint.mintTo(buyer_y_token, payer, [], 10_000_000_000);


  })

  it("Is initialized!", async () => {
        // Add your test here.
        const tx = await program.methods.initialize().rpc();
        console.log("Your transaction signature", tx);
      });

  it("Initialize escrow", async () => {
    const x_amount = new anchor.BN(40);
    const y_amount = new anchor.BN(40);
    console.log("x :: ", sellers_x_token);
    
    const tx = await program.methods.initialize(x_amount, y_amount)
      .accounts({
        seller: seller,
        xMint: x_mint.publicKey,
        yMint: y_mint.publicKey,
        sellerXToken: sellers_x_token,
        escrow: escrow,
        escrowedXTokens: escrowedXTokens.publicKey,
        tokenProgram: splToken.TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .signers([escrowedXTokens])
      .rpc({skipPreflight: true})

    console.log("TxSig :: ", tx);
  });

  it("Execute the trade", async () => { 
    const tx = await program.methods.execute()
      .accounts({
        buyer: buyer.publicKey,
        escrow: escrow,
        escrowedXTokens: escrowedXTokens.publicKey,
        sellersYTokens: sellers_y_token,
        buyerXTokens: buyer_x_token,
        buyerYTokens: buyer_y_token,
        tokenProgram: splToken.TOKEN_PROGRAM_ID
      })
      .signers([buyer])
      .rpc({skipPreflight: true})
  });

  it("Cancle the trade", async () => { 
    const tx = await program.methods.cancel()
    .accounts({
      seller: seller,
      escrow: escrow,
      escrowedXTokens: escrowedXTokens.publicKey,
      sellerXToken: sellers_x_token,
      tokenProgram: splToken.TOKEN_PROGRAM_ID
    })
    .rpc({skipPreflight: true})
    expect(1).to.equal(1)
  });

});

// import * as anchor from "@coral-xyz/anchor";
// import { Program } from "@coral-xyz/anchor";
// import { RebuSolana } from "../target/types/rebu_solana";

// describe("rebu_solana", () => {
//   // Configure the client to use the local cluster.
//   anchor.setProvider(anchor.AnchorProvider.env());

//   const program = anchor.workspace.RebuSolana as Program<RebuSolana>;

//   it("Is initialized!", async () => {
//     // Add your test here.
//     const tx = await program.methods.initialize().rpc();
//     console.log("Your transaction signature", tx);
//   });
// });









// import * as anchor from "@project-serum/anchor";
// import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
// import { Program } from "@project-serum/anchor";
// import { RebuSolana } from "../target/types/rebu_solana";
// import { LAMPORTS_PER_SOL, SYSVAR_RENT_PUBKEY, PublicKey } from "@solana/web3.js";
// import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";

// import { confirmTransaction, createAccountsMintsAndTokenAccounts, makeKeypairs } from '@solana-developers/helpers'


// describe("rebu_solana", async () => {
//   const provider =  anchor.AnchorProvider.local();
//   anchor.setProvider(provider);

//   const connection = provider.connection;

//   const program = anchor.workspace.RebuSolana as Program<RebuSolana>;
  
//   let alice: anchor.web3.Keypair;
//   let bob: anchor.web3.Keypair;

//   const payer = (provider.wallet as NodeWallet).payer;

//   const buyer =  anchor.web3.Keypair.generate();
//   console.log(`Buyer :: `, buyer.publicKey.toString());
  
//   const escrowedXTokens = anchor.web3.Keypair.generate();
//   console.log(`escrowedXTokens :: `, escrowedXTokens.publicKey.toString());

//   let x_mint;
//   let y_mint;
//   let sellers_x_token;
//   let sellers_y_token;
//   let buyer_x_token;
//   let buyer_y_token;
//   let escrow: anchor.web3.PublicKey;

//   before(async() => {
//     // Derive escrow address
//     [escrow] = anchor.web3.PublicKey.findProgramAddressSync([
//       anchor.utils.bytes.utf8.encode("escrow6"),
//       seller.toBuffer()
//     ], 
//     program.programId)

//     const usersMintsAndTokenAccounts = await createAccountsMintsAndTokenAccounts(
//       [
//         // Alice's token balances
//         [
//           // 1_000_000_000 of token A
//           1_000,
//           // 0 of token B
//           0,
//         ],
//         // Bob's token balances
//         [
//           // 0 of token A
//           0,
//           // 1_000_000_000 of token B
//           1_000,
//         ],
//       ],
//       1 * LAMPORTS_PER_SOL,
//       connection,
//       payer,
//     );

//     const users = usersMintsAndTokenAccounts.users;
//     alice = users[0];
//     bob = users[1];

//     const mints = usersMintsAndTokenAccounts.mints;
//     x_mint = mints[0];
//     y_mint = mints[1];

//     [alice, bob, x_mint, y_mint] = makeKeypairs(4);

//     const tokenAccounts = usersMintsAndTokenAccounts.tokenAccounts;

//     const aliceTokenAccountX = tokenAccounts[0][0];
//     const aliceTokenAccountY = tokenAccounts[0][1];

//     const bobTokenAccountX = tokenAccounts[1][0];
//     const bobTokenAccountY = tokenAccounts[1][1];

//     const accounts: Record<string, PublicKey> = {
//       tokenProgram: TOKEN_PROGRAM,
//     };

//     accounts.maker = alice.publicKey;
//     accounts.taker = bob.publicKey;
//     accounts.tokenMintA = x_mint.publicKey;
//     accounts.makerTokenAccountA = aliceTokenAccountX;
//     accounts.takerTokenAccountA = bobTokenAccountX;
//     accounts.tokenMintB = y_mint.publicKey;
//     accounts.makerTokenAccountB = aliceTokenAccountY;
//     accounts.takerTokenAccountB = bobTokenAccountY;
//   })

//   it("Initialize escrow", async () => {
//     const x_amount = new anchor.BN(40);
//     const y_amount = new anchor.BN(40);
//     console.log("x :: ", sellers_x_token);
    
//     const tx = await program.methods.initialize(x_amount, y_amount)
//       .accounts({
//         seller: seller,
//         xMint: x_mint.publicKey,
//         yMint: y_mint.publicKey,
//         sellerXToken: sellers_x_token,
//         escrow: escrow,
//         escrowedXTokens: escrowedXTokens.publicKey,
//         tokenProgram: splToken.TOKEN_PROGRAM_ID,
//         rent: SYSVAR_RENT_PUBKEY,
//         systemProgram: anchor.web3.SystemProgram.programId
//       })
//       .signers([escrowedXTokens])
//       .rpc({skipPreflight: true})

//     console.log("TxSig :: ", tx);
//   });

//   it("Execute the trade", async () => { 
//     const tx = await program.methods.execute()
//       .accounts({
//         buyer: buyer.publicKey,
//         escrow: escrow,
//         escrowedXTokens: escrowedXTokens.publicKey,
//         sellersYTokens: sellers_y_token,
//         buyerXTokens: buyer_x_token,
//         buyerYTokens: buyer_y_token,
//         tokenProgram: splToken.TOKEN_PROGRAM_ID
//       })
//       .signers([buyer])
//       .rpc({skipPreflight: true})
//   });

//   it("Cancle the trade", async () => { 
//     const tx = await program.methods.cancel()
//     .accounts({
//       seller: seller,
//       escrow: escrow,
//       escrowedXTokens: escrowedXTokens.publicKey,
//       sellerXToken: sellers_x_token,
//       tokenProgram: splToken.TOKEN_PROGRAM_ID
//     })
//     .rpc({skipPreflight: true})
//   });
// });

// import * as anchor from "@coral-xyz/anchor";
// import { Program } from "@coral-xyz/anchor";
// import { RebuSolana } from "../target/types/rebu_solana";

// describe("rebu_solana", () => {
//   // Configure the client to use the local cluster.
//   anchor.setProvider(anchor.AnchorProvider.env());

//   const program = anchor.workspace.RebuSolana as Program<RebuSolana>;

//   it("Is initialized!", async () => {
//     // Add your test here.
//     const tx = await program.methods.initialize().rpc();
//     console.log("Your transaction signature", tx);
//   });
// });

