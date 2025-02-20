#[cfg(test)]
mod tests {
    use super::*;
    use anchor_lang::prelude::*;
    use anchor_lang::system_program;
    use anchor_spl::token::{self, Token, TokenAccount, Mint, Transfer};
    use solana_program_test::*;
    use solana_sdk::{
        signature::Keypair,
        signer::Signer,
        system_instruction,
        transaction::Transaction,
    };

    fn setup_test_context() -> (ProgramTestContext, Keypair, Keypair, Keypair, Pubkey, Pubkey) {
        let program_id = Pubkey::new_unique();
        let mut program_test = ProgramTest::new(
            "simple_order",
            program_id,
            processor!(simple_order::entry),
        );

        let context = program_test.start_with_context().expect("Failed to start test context");

        let customer = Keypair::new();
        let supplier = Keypair::new();
        let rebu_mint = Keypair::new();

        let customer_token_account = Pubkey::new_unique();
        let supplier_token_account = Pubkey::new_unique();

        (context, customer, supplier, rebu_mint, customer_token_account, supplier_token_account)
    }

    #[test]
    fn test_create_order() {
        let mut runtime = tokio::runtime::Runtime::new().unwrap();
        let (mut context, customer, _, rebu_mint, customer_token_account, order_token_account) =
            setup_test_context();

        let order = Keypair::new();
        let price: u64 = 100;

        println!("Creating an order for {} tokens", price);

        let transaction = Transaction::new_signed_with_payer(
            &[system_instruction::create_account(
                &context.payer.pubkey(),
                &order.pubkey(),
                1_000_000,
                Order::LEN as u64,
                &context.program_id,
            )],
            Some(&context.payer.pubkey()),
            &[&context.payer, &order],
            context.last_blockhash,
        );

        runtime.block_on(async {
            context.banks_client.process_transaction(transaction).await.unwrap();
        });

        let order_account: Order = runtime.block_on(async {
            context
                .banks_client
                .get_account(order.pubkey())
                .await
                .unwrap()
                .expect("Order should be created")
                .try_into()
                .unwrap()
        });

        assert_eq!(order_account.customer, customer.pubkey());
        assert_eq!(order_account.price, price);
        assert_eq!(order_account.fulfilled, false);

        println!("Order created successfully and stored on-chain.");
    }

    #[test]
    fn test_fulfill_order() {
        let mut runtime = tokio::runtime::Runtime::new().unwrap();
        let (mut context, customer, supplier, rebu_mint, customer_token_account, supplier_token_account) =
            setup_test_context();

        let order = Keypair::new();
        let price: u64 = 100;

        println!("Fulfilling an order of {} tokens", price);

        let transfer_instruction = Transfer {
            from: customer_token_account,
            to: supplier_token_account,
            authority: customer.pubkey(),
        };

        let transaction = Transaction::new_signed_with_payer(
            &[token::transfer(
                CpiContext::new(
                    context.program_id.into(),
                    transfer_instruction,
                ),
                price,
            )],
            Some(&context.payer.pubkey()),
            &[&context.payer],
            context.last_blockhash,
        );

        runtime.block_on(async {
            context.banks_client.process_transaction(transaction).await.unwrap();
        });

        let order_account: Order = runtime.block_on(async {
            context
                .banks_client
                .get_account(order.pubkey())
                .await
                .unwrap()
                .expect("Order should exist")
                .try_into()
                .unwrap()
        });

        assert_eq!(order_account.fulfilled, true);

        println!("Order successfully fulfilled.");
    }

    #[test]
    fn test_fulfill_order_twice() {
        let mut runtime = tokio::runtime::Runtime::new().unwrap();
        let (mut context, customer, supplier, rebu_mint, customer_token_account, supplier_token_account) =
            setup_test_context();

        let order = Keypair::new();
        let price: u64 = 100;

        println!("Attempting to fulfill an already fulfilled order...");

        let transfer_instruction = Transfer {
            from: customer_token_account,
            to: supplier_token_account,
            authority: customer.pubkey(),
        };

        let transaction = Transaction::new_signed_with_payer(
            &[token::transfer(
                CpiContext::new(
                    context.program_id.into(),
                    transfer_instruction,
                ),
                price,
            )],
            Some(&context.payer.pubkey()),
            &[&context.payer],
            context.last_blockhash,
        );

        runtime.block_on(async {
            context.banks_client.process_transaction(transaction).await.unwrap();
        });

        let second_attempt = runtime.block_on(async {
            context.banks_client.process_transaction(transaction.clone()).await
        });

        assert!(second_attempt.is_err());
        println!("Expected failure: Order cannot be fulfilled twice.");
    }
}
