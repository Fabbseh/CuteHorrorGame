---------------------------
     BETTER SKYBOX    

   by Tanuki Digital
      version 0.1
---------------------------


WHAT IS IT?
Better skybox is a simple add-on that replaces Unity's built-in skybox renderer with a more adanced skybox option that offers better scene depth compositing, skybox rotation, and other useful features.


WHY IS IT INCLUDED WITH SUIMONO?
As of Suimono 2.0.03, some changes were made in suimono shaders in order to better facilitate both performance and compositing of it's effects.  These changes however have exposed issues with Unity 4's built-in skybox handler... specifically how it writes to the scene depth is apparently broken under some situations. This causes some water effects from rendering properly onto the skybox.



HOW DO I KNOW IF I NEED IT?
Case #1
In Suimono when using the InfiniteOcean setting sometimes the ocean view doesn't expand to the horizon, and appears covered up by part of the skybox texture.

Case #2
In Suimono the screen transition effects (water blur, and water droplets) when coming out of the water don't refract the scene skybox.



I NEED IT!  HOW DO I INSTALL IT?
Simply drag the BetterSkybox prefab from the base BetterSkybox folder directly onto your scene camera object (it should automatically be made a child of your camera object).  When the scene is played it will automatically replace the camera's skybox renderer system with it's own.  To add your own skybox image, simply drag it onto the Texture2D slot in the BetterSkybox UI.

NOTE:
Currently Better Skybox only handles spheremap oriented images.  The image needs to be marked as "Texture" in the Unity inspector, in other words it needs to be a single flat sphere mapped texture file, Unity cubemap images or Textures marked as "Reflection" in other words will not currently work properly.  Also note that while there are a number of options under the "SkyBox Type" setting, currently the only 2 options that work are "Custom SphereMap(2D)" and "Off".



STILL IN-DEVELOPMENT
Better Skybox is still in development.  The current version is included with Suimono to help fix some possible scene transparency errors, but eventually it will also be available as a small standalone offering on the asset store.