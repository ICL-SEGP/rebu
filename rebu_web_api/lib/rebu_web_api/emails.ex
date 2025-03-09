defmodule RebuWebApi.Emails do
  import Swoosh.Email

  @group [
    {"Alex", "alexander.reade21@imperial.ac.uk"},
    {"Gabriel", "gabriel.costa22@imperial.ac.uk"},
    {"Jacob", "jacob.hill22@imperial.ac.uk"},
    {"Tem", "temirlan.sergazin22@imperial.ac.uk"},
    {"Shivam", "shivam.subudhi22@imperial.ac.uk"},
    {"Geonwoo", "geonwoo.park20@imperial.ac.uk"}
  ]

  _ = @group

  def welcome(recipients) do
    recipients
    |> Enum.map(fn {name, email} ->
      new()
      # Send to each recipient separately
      |> to(email)
      |> from("ajr21@ic.ac.uk")
      |> reply_to("support@rebu.com")
      |> subject("Welcome to Rebu, #{name}!")
      |> html_body("""
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f7f7f7;
              color: #000;
              text-align: center;
              padding: 40px;
            }
            .container {
              background-color: #fff;
              padding: 20px;
              border-radius: 10px;
              max-width: 500px;
              margin: auto;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            h1 {
              font-size: 28px;
              color: #000;
              margin-bottom: 10px;
              letter-spacing: 2px;
              text-transform: uppercase;
            }
            p {
              font-size: 16px;
              color: #333;
            }
            .footer {
              margin-top: 20px;
              font-size: 12px;
              color: #777;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Rebu</h1>
            <p>Hi #{name},</p>
            <p>This is a test email from Rebu.</p>
            <div class="footer">
              &copy; #{Date.utc_today().year} Rebu. All rights reserved.
            </div>
          </div>
        </body>
      </html>
      """)
      |> text_body("Hi #{name}, this is a test email from Rebu.")
    end)
  end

  def send_purchase_email(purchase, download_url) do
    # Assuming you have this function
    user = purchase.user

    if user do
      new()
      |> to(user.email)
      # Replace with your sender email
      |> from("ajr21@ic.ac.uk")
      # Replace with your support email
      |> reply_to("support@rebu.com")
      # Replace with actual product name
      |> subject("Your Rebu Purchase: #{purchase.product_name}")
      |> html_body(purchase_email_body(user.name, purchase.product_name, download_url))
      |> text_body(purchase_email_text_body(user.name, purchase.product_name, download_url))
    end
  end

  defp purchase_email_body(username, product_name, download_url) do
    """
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f7f7f7;
            color: #000;
            text-align: center;
            padding: 40px;
          }
          .container {
            background-color: #fff;
            padding: 20px;
            border-radius: 10px;
            max-width: 500px;
            margin: auto;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
          h1 {
            font-size: 28px;
            color: #000;
            margin-bottom: 10px;
            letter-spacing: 2px;
            text-transform: uppercase;
          }
          p {
            font-size: 16px;
            color: #333;
          }
          .download-link {
            display: inline-block;
            padding: 10px 20px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
          }
          .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #777;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Rebu</h1>
          <p>Hi #{username},</p>
          <p>Thank you for your purchase of <strong>#{product_name}</strong>!</p>
          <p>You can download your rebu digital purchase using the link below:</p>
          <a href="#{download_url}" class="download-link text-white">Download Purchase</a>
          <div class="footer">
            &copy; #{Date.utc_today().year} Rebu. All rights reserved.
          </div>
        </div>
      </body>
    </html>
    """
  end

  defp purchase_email_text_body(username, product_name, download_url) do
    """
    Hi #{username},

    Thank you for your purchase of #{product_name}!

    You can download your project using the link below:

    #{download_url}

    © #{Date.utc_today().year} Rebu. All rights reserved.
    """
  end
end
