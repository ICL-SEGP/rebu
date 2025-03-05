defmodule RebuWebApi.Mailer do
  use Swoosh.Mailer, otp_app: :rebu_web_api

  def send_emails(emails) do
    Enum.each(emails, fn email -> send_email(email) end)
  end

  def send_email(email) do
    # Set AWS credentials dynamically
    aws_config = [
      adapter: Swoosh.Adapters.ExAwsAmazonSES,
      access_key: Application.get_env(:ses, :AWS_ACCESS_KEY_ID),
      secret: Application.get_env(:ses, :AWS_SECRET_ACCESS_KEY),
      region: Application.get_env(:ses, :AWS_REGION)
    ]

    Mailer.deliver(email, aws_config)
  end
end

# iex(1)> Application.get_env(:ses, :AWS_SECRET_ACCESS_KEY)
# "CA0V1LeARKhmWNAhy5gbtpV4Oa1Q8eV8+je7hnhI"
# iex(2)> Application.get_env(:aws, :AWS_SECRET_ACCESS_KEY)
# "UG5Cqx1/B/UynhBePShCAM2hVOSkFutOSJ16i0u0"
