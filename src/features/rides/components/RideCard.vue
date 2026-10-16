<script setup lang="ts">
import Badge from '@/components/ui/Badge.vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import Typography from '@/components/ui/Typography.vue'
import ElevationSparkline from '@/features/rides/components/ElevationSparkline.vue'
import IconArrow from '@/components/icons/IconArrow.vue'
import { RIDE_LEVEL_BADGE_COLORS } from '@/features/rides/constants/rideLevels'
import type { Ride } from '@/features/rides/types'

defineProps<{
  ride: Ride
}>()
</script>

<template>
  <Card as="article" interactive class="group">
    <div class="relative bg-snow">
      <ElevationSparkline
        :distance-km="ride.distanceKm"
        :elevation-m="ride.elevationM"
        class="absolute inset-x-0 bottom-0"
      />
      <div class="relative flex items-start justify-between gap-3 px-6 pt-5">
        <Typography as="span" variant="body-sm" tone="accent" class="font-medium">
          {{ ride.meetingPoint }}
        </Typography>
        <Badge :color="RIDE_LEVEL_BADGE_COLORS[ride.level]" dot>
          {{ ride.level }}
        </Badge>
      </div>
    </div>

    <div class="p-6 pt-4">
      <Typography as="h2" variant="heading-sm">
        {{ ride.title }}
      </Typography>

      <div class="mt-4 flex items-end gap-6">
        <div class="flex items-baseline gap-1">
          <Typography as="span" variant="numeric-xl">
            {{ ride.distanceKm }}
          </Typography>
          <Typography as="span" variant="body-sm" tone="muted" class="pb-0.5 font-semibold">
            km
          </Typography>
        </div>

        <div class="flex items-baseline gap-1">
          <Typography as="span" variant="body-sm" tone="muted" class="pb-0.5 font-semibold">
            +
          </Typography>
          <Typography as="span" variant="numeric-md">
            {{ ride.elevationM }}
          </Typography>
          <Typography as="span" variant="body-sm" tone="muted" class="pb-0.5 font-semibold">
            m
          </Typography>
        </div>
      </div>

      <Button :to="{ name: 'ride-detail', params: { id: ride.id } }" variant="link" class="mt-5">
        Ver detalles
        <IconArrow class="transition-transform duration-200 group-hover:translate-x-0.5" />
      </Button>
    </div>
  </Card>
</template>
