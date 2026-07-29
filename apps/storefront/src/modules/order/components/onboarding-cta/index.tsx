"use client"

import { resetOnboardingState } from "@lib/data/onboarding"
import { Button, Container, Text } from "@modules/common/components/ui"
import { useTranslations } from "next-intl"

const OnboardingCta = ({ orderId }: { orderId: string }) => {
  const t = useTranslations("order")
  return (
    <Container className="max-w-4xl h-full bg-ui-bg-subtle w-full">
      <div className="flex flex-col gap-y-4 center p-4 md:items-center">
        <Text className="text-ui-fg-base text-xl">
          {t("Your test order was successfully created! 🎉")}
        </Text>
        <Text className="text-ui-fg-subtle text-small-regular">
          {t("You can now complete setting up your store in the admin")}
        </Text>
        <Button
          className="w-fit"
          size="large"
          onClick={() => resetOnboardingState(orderId)}
        >
          {t("Complete setup in admin")}
        </Button>
      </div>
    </Container>
  )
}

export default OnboardingCta
