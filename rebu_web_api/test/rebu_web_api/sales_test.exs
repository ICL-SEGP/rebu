defmodule RebuWebApi.SalesTest do
  use RebuWebApi.DataCase

  alias RebuWebApi.Sales

  describe "offers" do
    alias RebuWebApi.Sales.Offer

    import RebuWebApi.SalesFixtures

    @invalid_attrs %{desc: nil, affiliate_link: nil, rebate_percentage: nil, offer_start: nil, offer_end: nil}

    test "list_offers/0 returns all offers" do
      offer = offer_fixture()
      assert Sales.list_offers() == [offer]
    end

    test "get_offer!/1 returns the offer with given id" do
      offer = offer_fixture()
      assert Sales.get_offer!(offer.id) == offer
    end

    test "create_offer/1 with valid data creates a offer" do
      valid_attrs = %{desc: "some desc", affiliate_link: "some affiliate_link", rebate_percentage: "120.5", offer_start: ~N[2025-01-20 12:08:00], offer_end: ~N[2025-01-20 12:08:00]}

      assert {:ok, %Offer{} = offer} = Sales.create_offer(valid_attrs)
      assert offer.desc == "some desc"
      assert offer.affiliate_link == "some affiliate_link"
      assert offer.rebate_percentage == Decimal.new("120.5")
      assert offer.offer_start == ~N[2025-01-20 12:08:00]
      assert offer.offer_end == ~N[2025-01-20 12:08:00]
    end

    test "create_offer/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Sales.create_offer(@invalid_attrs)
    end

    test "update_offer/2 with valid data updates the offer" do
      offer = offer_fixture()
      update_attrs = %{desc: "some updated desc", affiliate_link: "some updated affiliate_link", rebate_percentage: "456.7", offer_start: ~N[2025-01-21 12:08:00], offer_end: ~N[2025-01-21 12:08:00]}

      assert {:ok, %Offer{} = offer} = Sales.update_offer(offer, update_attrs)
      assert offer.desc == "some updated desc"
      assert offer.affiliate_link == "some updated affiliate_link"
      assert offer.rebate_percentage == Decimal.new("456.7")
      assert offer.offer_start == ~N[2025-01-21 12:08:00]
      assert offer.offer_end == ~N[2025-01-21 12:08:00]
    end

    test "update_offer/2 with invalid data returns error changeset" do
      offer = offer_fixture()
      assert {:error, %Ecto.Changeset{}} = Sales.update_offer(offer, @invalid_attrs)
      assert offer == Sales.get_offer!(offer.id)
    end

    test "delete_offer/1 deletes the offer" do
      offer = offer_fixture()
      assert {:ok, %Offer{}} = Sales.delete_offer(offer)
      assert_raise Ecto.NoResultsError, fn -> Sales.get_offer!(offer.id) end
    end

    test "change_offer/1 returns a offer changeset" do
      offer = offer_fixture()
      assert %Ecto.Changeset{} = Sales.change_offer(offer)
    end
  end
end
