<script setup>
  import { defineProps } from 'vue'

  const props = defineProps({
    user: {
      type: Object,
      required: true,
    },
    id: {
      type: Number,
      required: true,
    },

  })

  //Si l'url est null, on met le placeholder
  if (props.user.url_img_avatar === null) {
    props.user.url_img_avatar = '/urbex-front/img/profile-placeholder.png'
    // console.log(props.user.url_img_avatar)
  }

  //Pour l'affichage de la classe "me"
  let isMe = false;
  // console.log("props.user.user_id", props.user.user_id)
  if (props.user.user_id)
    isMe = true;
</script>

<template>

  <div class="row" :class="{ first: props.id === 0, second: props.id === 1, third: props.id === 2, me: isMe === true }">
    <div class="rank">{{ props.id + 1 }}</div>
    <img class="avatar" :src="props.user.url_img_avatar" aria-hidden="true" />
    <div class="name">{{ props.user.nickname }}</div>
    <div class="xp">{{ props.user.score }}</div>
  </div>

</template>

<style lang="scss" scoped>
  @use '@/styles/abstracts' as *;
  @use 'sass:color';

  .row {
    display: flex;
    align-items: center;
    gap: 12px;
    background: $color-surface;
    border: 1px solid $color-border;
    border-radius: 14px;
    padding: 10px 12px;
    box-shadow: 0 3px 10px -4px rgba(0, 0, 0, 0.55);
  }

  .row.first {
    border: 3px solid #f59e0b;

    .xp {
      color: #f59e0b;
    }
  }

  .row.second {
    border: 2px solid #94a3b8;

    .xp {
      color: #94a3b8;
    }
  }

  .row.third {
    border: 1px solid #a16207;

    .xp {
      color: #a16207;
    }
  }

  .me {
    background-color: color.adjust($color-success, $alpha: -.75);
  }

  .rank {
    width: 34px;
    text-align: center;
    font-weight: 700;
    color: $color-text;
  }

  .avatar {
    width: 42px;
    height: 42px;
    padding: 3px;
    border-radius: 50%;
    box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.18);
  }

  .name {
    flex: 1;
    color: $color-text;
    font-weight: 600;
  }

  .xp {
    color: $color-text-dim;
    font-size: 0.9rem;
    font-weight: 600;
  }
</style>
