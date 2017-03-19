#! /bin/sh


# Set up Crashlytics
if [ -n "$FABRIC_API_KEY" ] && [ -n "$FABRIC_BUILD_SECRET" ]
then
    "${PODS_ROOT}/Fabric/run" ${FABRIC_API_KEY} ${FABRIC_BUILD_SECRET}
else
    echo "Warning: Fabric secrets not set. Crashlytics will not be enabled for this build."
fi
