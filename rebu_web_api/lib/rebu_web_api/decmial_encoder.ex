# defimpl Jason.Encoder, for: Decimal do
#   def encode(decimal, opts) do
#     # Convert the Decimal to a string before encoding
#     Jason.Encode.string(Decimal.to_string(decimal), opts)
#   end
# end
