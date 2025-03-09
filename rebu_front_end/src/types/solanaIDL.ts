/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/rebu_solana.json`.
 */
export type RebuSolana = {
  address: "5b8N346ZbwB3PbpYthoUTLtrdw9qpbKue52S1bDCBter";
  metadata: {
    name: "rebuSolana";
    version: "0.1.0";
    spec: "0.1.0";
    description: "Created with Anchor";
  };
  instructions: [
    {
      name: "addListing";
      discriminator: [165, 124, 143, 190, 249, 53, 128, 195];
      accounts: [
        {
          name: "seller";
          docs: ["Affiliate"];
          writable: true;
          signer: true;
        },
        {
          name: "mint";
          docs: ["Rebu mint"];
          writable: true;
        },
        {
          name: "sellerAta";
          docs: ["ATA of seller"];
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "seller";
              },
              {
                kind: "const";
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ];
              },
              {
                kind: "account";
                path: "mint";
              }
            ];
            program: {
              kind: "const";
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ];
            };
          };
        },
        {
          name: "productListing";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [112, 114, 111, 100, 117, 99, 116];
              },
              {
                kind: "const";
                value: [108, 105, 115, 116, 105, 110, 103];
              },
              {
                kind: "account";
                path: "seller";
              },
              {
                kind: "arg";
                path: "id";
              }
            ];
          };
        },
        {
          name: "associatedTokenProgram";
          address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
        },
        {
          name: "tokenProgram";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        }
      ];
      args: [
        {
          name: "id";
          type: "u64";
        },
        {
          name: "stock";
          type: "u64";
        },
        {
          name: "price";
          type: "f64";
        }
      ];
    },
    {
      name: "burnRebu";
      discriminator: [166, 227, 223, 55, 117, 147, 136, 175];
      accounts: [
        {
          name: "signer";
          writable: true;
          signer: true;
        },
        {
          name: "mint";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [114, 101, 98, 117, 49, 50, 51];
              },
              {
                kind: "const";
                value: [109, 105, 110, 116];
              }
            ];
          };
        },
        {
          name: "tokenAccount";
          writable: true;
        },
        {
          name: "vault";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [114, 101, 98, 117, 49, 50, 51];
              },
              {
                kind: "const";
                value: [118, 97, 117, 108, 116];
              }
            ];
          };
        },
        {
          name: "tokenProgram";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        }
      ];
      args: [
        {
          name: "amount";
          type: "f64";
        }
      ];
    },
    {
      name: "createToken";
      discriminator: [84, 52, 204, 228, 24, 140, 234, 75];
      accounts: [
        {
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "mint";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [114, 101, 98, 117, 49, 50, 51];
              },
              {
                kind: "const";
                value: [109, 105, 110, 116];
              }
            ];
          };
        },
        {
          name: "vault";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [114, 101, 98, 117, 49, 50, 51];
              },
              {
                kind: "const";
                value: [118, 97, 117, 108, 116];
              }
            ];
          };
        },
        {
          name: "tokenProgram";
          address: "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        }
      ];
      args: [
        {
          name: "uri";
          type: "string";
        }
      ];
    },
    {
      name: "makePurchase";
      discriminator: [193, 62, 227, 136, 105, 212, 201, 20];
      accounts: [
        {
          name: "customer";
          docs: ["Customer"];
          writable: true;
          signer: true;
        },
        {
          name: "mint";
          docs: ["Rebu mint"];
          writable: true;
        },
        {
          name: "seller";
          writable: true;
        },
        {
          name: "sellerAta";
          docs: ["ATA of seller"];
          writable: true;
        },
        {
          name: "customerAta";
          docs: ["ATA of customer"];
          writable: true;
        },
        {
          name: "productListing";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [112, 114, 111, 100, 117, 99, 116];
              },
              {
                kind: "const";
                value: [108, 105, 115, 116, 105, 110, 103];
              },
              {
                kind: "account";
                path: "seller";
              },
              {
                kind: "arg";
                path: "id";
              }
            ];
          };
        },
        {
          name: "productPurchase";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [112, 114, 111, 100, 117, 99, 116];
              },
              {
                kind: "const";
                value: [112, 117, 114, 99, 104, 97, 115, 101];
              },
              {
                kind: "account";
                path: "seller";
              },
              {
                kind: "arg";
                path: "id";
              },
              {
                kind: "account";
                path: "customer";
              }
            ];
          };
        },
        {
          name: "associatedTokenProgram";
          address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
        },
        {
          name: "tokenProgram";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        }
      ];
      args: [
        {
          name: "id";
          type: "u64";
        }
      ];
    },
    {
      name: "mintRebuTo";
      discriminator: [13, 139, 116, 57, 55, 202, 156, 121];
      accounts: [
        {
          name: "signer";
          writable: true;
          signer: true;
        },
        {
          name: "mint";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [114, 101, 98, 117, 49, 50, 51];
              },
              {
                kind: "const";
                value: [109, 105, 110, 116];
              }
            ];
          };
        },
        {
          name: "recipient";
          writable: true;
        },
        {
          name: "vault";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [114, 101, 98, 117, 49, 50, 51];
              },
              {
                kind: "const";
                value: [118, 97, 117, 108, 116];
              }
            ];
          };
        },
        {
          name: "tokenProgram";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        }
      ];
      args: [
        {
          name: "amount";
          type: "f64";
        }
      ];
    },
    {
      name: "modifyListing";
      discriminator: [36, 132, 230, 119, 139, 147, 164, 183];
      accounts: [
        {
          name: "seller";
          docs: ["Affiliate"];
          writable: true;
          signer: true;
          relations: ["productListing"];
        },
        {
          name: "productListing";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [112, 114, 111, 100, 117, 99, 116];
              },
              {
                kind: "const";
                value: [108, 105, 115, 116, 105, 110, 103];
              },
              {
                kind: "account";
                path: "seller";
              },
              {
                kind: "arg";
                path: "id";
              }
            ];
          };
        },
        {
          name: "tokenProgram";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        }
      ];
      args: [
        {
          name: "id";
          type: "u64";
        },
        {
          name: "stock";
          type: "u64";
        },
        {
          name: "price";
          type: "f64";
        }
      ];
    },
    {
      name: "verifyPurchase";
      discriminator: [205, 162, 209, 116, 231, 224, 181, 251];
      accounts: [
        {
          name: "seller";
          writable: true;
          signer: true;
          relations: ["productPurchase"];
        },
        {
          name: "customer";
          writable: true;
        },
        {
          name: "productPurchase";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [112, 114, 111, 100, 117, 99, 116];
              },
              {
                kind: "const";
                value: [112, 117, 114, 99, 104, 97, 115, 101];
              },
              {
                kind: "account";
                path: "seller";
              },
              {
                kind: "arg";
                path: "id";
              },
              {
                kind: "account";
                path: "customer";
              }
            ];
          };
        }
      ];
      args: [
        {
          name: "id";
          type: "u64";
        }
      ];
    }
  ];
  accounts: [
    {
      name: "productListing";
      discriminator: [12, 188, 195, 61, 183, 115, 249, 54];
    },
    {
      name: "purchaseReceipt";
      discriminator: [79, 127, 222, 137, 154, 131, 150, 134];
    }
  ];
  errors: [
    {
      code: 6000;
      name: "outOfStock";
    },
    {
      code: 6001;
      name: "invalidListing";
    },
    {
      code: 6002;
      name: "listingAlreadyExists";
    }
  ];
  types: [
    {
      name: "productListing";
      type: {
        kind: "struct";
        fields: [
          {
            name: "seller";
            type: "pubkey";
          },
          {
            name: "mint";
            type: "pubkey";
          },
          {
            name: "id";
            type: "u64";
          },
          {
            name: "stock";
            type: "u64";
          },
          {
            name: "price";
            type: "f64";
          },
          {
            name: "bump";
            type: "u8";
          }
        ];
      };
    },
    {
      name: "purchaseReceipt";
      type: {
        kind: "struct";
        fields: [
          {
            name: "seller";
            type: "pubkey";
          },
          {
            name: "customer";
            type: "pubkey";
          },
          {
            name: "productId";
            type: "u64";
          },
          {
            name: "bump";
            type: "u8";
          }
        ];
      };
    }
  ];
};
