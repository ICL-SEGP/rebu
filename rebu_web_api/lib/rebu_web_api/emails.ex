defmodule RebuWebApi.Emails do
  import Swoosh.Email

  # @group [
  #   {"Alex", "alexander.reade21@imperial.ac.uk"},
  #   {"Gabriel", "gabriel.costa22@imperial.ac.uk"},
  #   {"Jacob", "jacob.hill22@imperial.ac.uk"},
  #   {"Tem", "temirlan.sergazin22@imperial.ac.uk"},
  #   {"Shivam", "shivam.subudhi22@imperial.ac.uk"},
  #   {"Geonwoo", "geonwoo.park20@imperial.ac.uk"}
  # ]

  def send_block_notification(user) do
    if user do
      new()
      |> to(user.email)
      |> from("ajr21@ic.ac.uk")
      |> reply_to("support@rebu.com")
      |> subject("Notification: Account Blocked on Rebu Network")
      |> html_body(block_notification_body(user.first_name))
    end
  end

  def send_purchase_email(user, purchase) do
    # Assuming you have this function

    if user do
      new()
      |> to(user.email)
      # Replace with your sender email
      |> from("ajr21@ic.ac.uk")
      # Replace with your support email
      |> reply_to("support@rebu.com")
      # Replace with actual product name
      |> subject("Your Rebu Purchase: #{purchase.product.name}")
      |> html_body(purchase_email_body(user.first_name, purchase.product.name, purchase.product.file_url))
    end
  end

  def welcome(user) do
    new()
    # Send to each recipient separately
    |> to(user.email)
    |> from("ajr21@ic.ac.uk")
    |> reply_to("support@rebu.com")
    |> subject("Welcome to Rebu, #{user.first_name}!")
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
          <p>Hi #{user.first_name},</p>
          <p>Thank you for joing Rebu!</p>
          <div class="footer">
            &copy; #{Date.utc_today().year} Rebu. All rights reserved.
          </div>
        </div>
      </body>
    </html>
    """)
  end

  defp purchase_email_body(first_name, product_name, download_url) do
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
          <p>Hi #{first_name},</p>
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

  defp block_notification_body(first_name) do
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
            text-align: left;
          }
          .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #777;
          }
          .warning {
            color: red;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Rebu - Account Notification</h1>
          <p>Dear #{first_name},</p>
          <p>We are writing to inform you that your account has been blocked from participating in the Rebu affiliate network. This decision was made due to concerns regarding your conduct on the platform.</p>
          <p class="warning">Please note that while your affiliate network access is restricted, you are still able to use the Rebu marketplace and withdraw your token balance.</p>
          <div class="footer">
            &copy; #{Date.utc_today().year} Rebu. All rights reserved.
          </div>
        </div>
      </body>
    </html>
    """
  end
end
