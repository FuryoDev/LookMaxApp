<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>
          LookMax App
        </q-toolbar-title>
        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
    <q-footer>
      <q-tabs>
        <q-route-tab name="User" to="user" icon="mail"></q-route-tab>
        <q-route-tab name="Import" to="/" icon="alarm"></q-route-tab>
        <q-route-tab name="Import" to="error" icon="movie"></q-route-tab>
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">

</script>
